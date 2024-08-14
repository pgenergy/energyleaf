"use server";

import { getActionSession } from "@/lib/auth/auth.action";
import { getUserData } from "@/query/user";
import { logError, trackAction } from "@energyleaf/db/query";
import { type DefaultActionReturnPayload, UserNotLoggedInError } from "@energyleaf/lib";
import { waitUntil } from "@vercel/functions";
import type { Session } from "lucia";
import { cache } from "react";

interface OpenStreetMapProps {
    lat: number;
    lon: number;
    display_name: string;
}

interface WeatherProps {
    timestamp: string;
    solar: number;
}

export interface SolarResultProps {
    last30d: SolarResultDetailsProps;
    next24h: SolarResultDetailsProps;
    location: string;
}

export interface SolarResultDetailsProps {
    solar: number;
    result: number;
    price: number | null;
}

export async function calculateSolar(watts: number): Promise<DefaultActionReturnPayload<SolarResultProps>> {
    let session: Session | null = null;
    try {
        const { session: actionSession, user } = await getActionSession();
        session = actionSession;

        if (!session || !user) {
            throw new UserNotLoggedInError();
        }

        const { lat, lon, display_name } = await lookupLocation(user.address);
        const weatherData = await getWeather(lat, lon);

        const userData = await getUserData(user.id);
        if (!userData) {
            throw new Error("User data not found");
        }

        const next24h = calculate(
            weatherData.filter((x) => new Date(x.timestamp) >= new Date()),
            watts,
            userData.workingPrice,
        );
        const last30d = calculate(
            weatherData.filter((x) => new Date(x.timestamp) < new Date()),
            watts,
            userData.workingPrice,
        );

        const payload: SolarResultProps = { next24h, last30d, location: display_name };
        const success = !!userData.workingPrice;
        const message = success ? "" : "Es wurde kein Preis hinterlegt";
        waitUntil(
            trackAction("calculate-result", "calculate-solar", "web", { session, watts, success, message, payload }),
        );
        return { success, message, payload };
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            waitUntil(logError("user/not-logged-in", "calculate-solar", "web", { session }, err));
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um dies zu bearbeiten.",
            };
        }
        waitUntil(logError("solar/error", "calculate-solar", "web", { session }, err));
        return {
            success: false,
            message: "Ein Fehler ist aufgetreten.",
        };
    }
}

function calculate(weatherData: WeatherProps[], watts: number, workingPrice: number | null): SolarResultDetailsProps {
    const solar = weatherData.reduce((accumulator, currentValue) => accumulator + currentValue.solar, 0);
    const efficiency = 0.8;
    const result = efficiency * solar * (watts / 1000);

    const price = workingPrice === null ? null : workingPrice * result;
    return { solar, result, price };
}

const lookupLocation = cache(async (loc: string) => {
    const osmReq = await fetch(
        `https://nominatim.openstreetmap.org/search.php?q=${loc}&accept-language=de&format=jsonv2`,
    );

    const body = (await osmReq.json()) as OpenStreetMapProps[];

    if (!osmReq.ok || !body) {
        throw { message: "OpenStreetMap Request Error", osmReq };
    }

    return body[0];
});

const getWeather = async (lat: number, lon: number) => {
    let d = new Date();
    d.setDate(new Date().getDate() - 30);
    d.setMinutes(0, 0, 0);
    const date = d.toISOString();

    d = new Date();
    d.setDate(new Date().getDate() + 1);
    d.setMinutes(0, 0, 0);
    const last_date = d.toISOString();

    const weatherReq = await fetch(
        `https://api.brightsky.dev/weather?date=${date}&last_date=${last_date}&lat=${lat}&lon=${lon}`,
        {
            headers: {
                Accept: "application/json",
            },
            next: {
                revalidate: 60 * 60,
            },
        },
    );

    if (!weatherReq.ok) {
        throw { message: "BrightSky Request Error", weatherReq };
    }

    return (await weatherReq.json()).weather as WeatherProps[];
};
