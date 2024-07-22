import { createHash } from "node:crypto";
import { env } from "@/env.mjs";
import { getUserById, getUserData, log, logError } from "@energyleaf/db/query";
import { waitUntil } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";

interface Props {
    userId: string;
    userHash: string;
    watts: number;
}

interface OpenStreetMapProps {
    lat: number;
    lon: number;
    display_name: string;
}

interface BrightSkyProps {
    weather: {
        timestamp: string;
        solar: number;
    }[];
}

export const POST = async (req: NextRequest) => {
    try {
        const { userId, userHash, watts } = (await req.json()) as Props;
        const details = {
            userId,
            userHash,
            watts,
        };
        if (!userId || !userHash) {
            waitUntil(log("user/missing-user-id-or-user-hash", "error", "solar", "api", details));
            return NextResponse.json(
                {
                    error: "Sie haben keinen Zugriff.",
                },
                {
                    status: 401,
                },
            );
        }

        const hash = createHash("sha256").update(`${userId}${env.HASH_SECRET}`).digest("hex");
        if (hash !== userHash) {
            waitUntil(log("user/invalid-user-hash", "error", "solar", "api", details));
            return NextResponse.json(
                {
                    error: "Sie haben keinen Zugriff.",
                },
                {
                    status: 401,
                },
            );
        }

        const user = await getUserById(userId);
        if (!user) {
            waitUntil(log("user/invalid-user-id", "error", "solar", "api", details));
            return NextResponse.json(
                {
                    error: "Sie haben keinen Zugriff.",
                },
                {
                    status: 401,
                },
            );
        }

        if (!watts) {
            waitUntil(log("solar/missing-parameter", "error", "solar", "api", details));
            return NextResponse.json(
                {
                    error: "Bad Request",
                },
                {
                    status: 400,
                },
            );
        }

        const { lat, lon } = await lookupLocation(user.address);
        const weatherData = await getWeather(lat, lon);

        const userData = await getUserData(userId);
        if (!userData) {
            waitUntil(log("user/missing-userdata", "error", "solar", "api", details));
            return NextResponse.error();
        }

        const next24h = calculate(
            weatherData.weather.filter((x) => new Date(x.timestamp) >= new Date()),
            watts,
            userData.workingPrice,
        );
        const last30d = calculate(
            weatherData.weather.filter((x) => new Date(x.timestamp) < new Date()),
            watts,
            userData.workingPrice,
        );

        return NextResponse.json({ next24h, last30d });
    } catch (err) {
        waitUntil(logError("solar/unhandled-exception", "solar", "api", req, err));
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

async function lookupLocation(loc: string) {
    const osmReq = await fetch(
        `https://nominatim.openstreetmap.org/search.php?q=${loc}&accept-language=de&format=jsonv2`,
    );

    const body = (await osmReq.json()) as OpenStreetMapProps[];

    if (!osmReq.ok || !body) {
        throw { message: "OpenStreetMap Request Error", osmReq };
    }

    return body[0];
}

async function getWeather(lat: number, lon: number) {
    const date = new Date();
    date.setDate(new Date().getDate() - 30);

    const last_date = new Date();
    last_date.setDate(new Date().getDate() + 1);

    const weatherReq = await fetch(
        `https://api.brightsky.dev/weather?date=${date.toISOString()}&last_date=${last_date.toISOString()}&lat=${lat}&lon=${lon}`,
        {
            headers: {
                Accept: "application/json",
            },
        },
    );

    if (!weatherReq.ok) {
        throw { message: "BrightSky Request Error", weatherReq };
    }

    return (await weatherReq.json()) as BrightSkyProps;
}

function calculate(weatherData, watts: number, workingPrice: number | null) {
    const solar = weatherData.reduce((accumulator, currentValue) => accumulator + currentValue.solar, 0);
    const efficiency = 0.8;
    const result = efficiency * solar * (watts / 1000);
    if (workingPrice) {
        const price = workingPrice * result;
        return { solar, result, price };
    }
    return { solar, result };
}
