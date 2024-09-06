import { env, getUrl } from "@/env.mjs";
import { log, logError } from "@energyleaf/postgres/query/logs";
import { getAllSensors } from "@energyleaf/postgres/query/sensor";
import { waitUntil } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

export const GET = async (req: NextRequest) => {
    const cronSecret = env.CRON_SECRET;
    if (!req.headers.has("Authorization") || req.headers.get("Authorization") !== `Bearer ${cronSecret}`) {
        waitUntil(log("request-unauthorized/missing-key", "error", "mark-peaks", "api", req));
        return NextResponse.json({ status: 401, statusMessage: "Unauthorized" });
    }

    try {
        const sensors = await getAllSensors(true);
        const sensorIds = sensors.map((d) => d.id);

        const promises: Promise<void>[] = [];
        waitUntil(
            log("mark-peaks/length", "info", "mark-peaks", "api", {
                numberOfSensors: sensorIds.length,
            }),
        );
        const processEndpoint = `https://${getUrl(env)}/api/v1/process_peaks`;
        for (let i = 0; i < sensorIds.length; i++) {
            const sensorId = sensorIds[i];

            const fn = async () => {
                try {
                    await fetch(processEndpoint, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            secret: cronSecret,
                            sensorId,
                        }),
                    });
                } catch (err) {
                    console.error(err);
                    waitUntil(logError("mark-peaks/failed", "mark-peaks", "api", { sensorId }, err));
                }
            };
            promises.push(fn());
        }

        // use allSettled so we dont abort if one fails
        await Promise.allSettled(promises);
        return NextResponse.json({ statusMessage: "Peaks successfully marked and classified where applicable." });
    } catch (err) {
        waitUntil(
            logError(
                "mark-peaks/all-error",
                "mark-peaks",
                "api",
                {
                    time: new Date().toISOString(),
                    req,
                },
                err,
            ),
        );
        return NextResponse.json({ statusMessage: "Internal Server Error" }, { status: 500 });
    }
};
