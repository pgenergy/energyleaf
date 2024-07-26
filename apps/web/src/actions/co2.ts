"use server";

import { lookupGeoLocation } from "@/actions/geo";
import { env } from "@/env.mjs";
import { getActionSession } from "@/lib/auth/auth.action";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { log, logError } from "@energyleaf/db/query";
import { type IDefaultActionReturnPayload, UserNotLoggedInError } from "@energyleaf/lib";
import { waitUntil } from "@vercel/functions";
import type { Session, User } from "lucia";

export interface ElectricityMapsCarbonIntensity {
    datetime: Date;
    carbonIntensity: number;
}

export const calculateCO2eqEmissions = async (start: Date, end: Date): Promise<IDefaultActionReturnPayload<number>> => {
    let session: Session | null = null;
    try {
        let user: User | null;
        ({ session, user } = await getActionSession());
        if (!session) {
            throw new UserNotLoggedInError();
        }
        if (!user) {
            throw new UserNotLoggedInError();
        }

        const sensorId = await getElectricitySensorIdForUser(user.id);
        if (!sensorId) {
            throw Error("Sensor not found");
        }

        const energyData = await getEnergyDataForSensor(start, end, sensorId);
        const { lat, lon } = await lookupGeoLocation(user.address);
        const carbon = await getCO2Emissions(lat, lon);

        const emissions = energyData.reduce((acc, cur) => {
            const { carbonIntensity } = carbon.reduce(
                (p, v) => getBestFittingCarbonIntensity(cur.timestamp, p, v),
                carbon[0],
            );
            return acc + cur.value * carbonIntensity;
        }, 0);

        waitUntil(log("co2/success", "info", "calculate-co2eq-emissions", "web", { payload: emissions }));
        return {
            success: true,
            payload: emissions,
            message: "",
        };
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            waitUntil(logError("user/not-logged-in", "calculate-co2", "web", { session }, err));
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um dies zu bearbeiten.",
            };
        }
        waitUntil(logError("solar/error", "calculate-co2", "web", { session }, err));
        return {
            success: false,
            message: "Ein Fehler ist aufgetreten.",
        };
    }
};

const getCO2Emissions = async (lat: number, lon: number) => {
    if (!env.CO2_API_KEY) {
        throw Error("Co2 API key is missing");
    }

    const response = await fetch(
        `https://api.electricitymap.org/v3/carbon-intensity/history?lat=${lat.toFixed(2)}&lon=${lon.toFixed(2)}`,
        {
            headers: {
                "auth-token": env.CO2_API_KEY,
            },
            next: {
                revalidate: 3600,
            },
        },
    );

    return (await response.json()).history as [ElectricityMapsCarbonIntensity];
};

const getBestFittingCarbonIntensity = (
    x: Date,
    acc: ElectricityMapsCarbonIntensity,
    curr: ElectricityMapsCarbonIntensity,
) => {
    const diff1 = Math.abs(x.getTime() - new Date(acc.datetime).getTime());
    const diff2 = Math.abs(x.getTime() - new Date(curr.datetime).getTime());
    return diff1 < diff2 ? acc : curr;
};
