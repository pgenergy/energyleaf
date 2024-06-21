import { env } from "@/env.mjs";
import { findAndMarkPeaks, getAllSensors, logError } from "@energyleaf/db/query";
import { waitUntil } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    const reportApiKey = env.CRON_SECRET;
    if (!req.headers.has("Authorization") || req.headers.get("Authorization") !== reportApiKey) {
        return NextResponse.json({ status: 401, statusMessage: "Unauthorized" });
    }

    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 1, 0, 0, 0);
    const endDate = new Date();
    endDate.setHours(endDate.getHours() - 1, 59, 59, 999);

    try {
        const sensors = await getAllSensors(true);
        const sensorIds = sensors.map((d) => d.id);

        const promises: Promise<void>[] = [];
        for (let i = 0; i < sensorIds.length; i++) {
            const sensorId = sensorIds[i];

            promises.push(
                findAndMarkPeaks({
                    sensorId,
                    start: startDate,
                    end: endDate,
                }),
            );
        }

        // use allSettled so we dont abort if one fails
        const results = await Promise.allSettled(promises);
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const sensorId = sensorIds[i];
            if (result.status === "rejected") {
                waitUntil(
                    logError(
                        "mark-peaks/user-error",
                        "mark-peaks",
                        "api",
                        {
                            sensorId,
                            start: startDate.toISOString(),
                            end: endDate.toISOString(),
                        },
                        new Error(result.reason),
                    ),
                );
            }
        }
    } catch (err) {
        waitUntil(
            logError(
                "mark-peaks/all-error",
                "mark-peaks",
                "api",
                {}, // empty body - dont know what to log because whole route fails
                err,
            ),
        );
        return;
    }
};
