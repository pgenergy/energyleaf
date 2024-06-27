import { env } from "@/env.mjs";
import { findAndMark, getAllSensors, logError } from "@energyleaf/db/query";
import type { SensorDataSelectType } from "@energyleaf/db/types";
import { waitUntil } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const reportApiKey = env.CRON_SECRET;
    if (!req.headers.has("Authorization") || req.headers.get("Authorization") !== reportApiKey) {
        return NextResponse.json({ status: 401, statusMessage: "Unauthorized" });
    }

    const startDate = new Date();
    const endDate = new Date();

    // shift date back by half an hour to not mark and perform on newest values
    if (startDate.getMinutes() >= 30) {
        startDate.setHours(startDate.getHours() - 1, 30, 0, 0);
        endDate.setHours(endDate.getHours() - 1, 59, 59, 999);
    } else {
        startDate.setHours(startDate.getHours() - 1, 0, 0, 0);
        endDate.setHours(endDate.getHours() - 1, 30, 59, 59);
    }

    try {
        const sensors = await getAllSensors(true);
        const sensorIds = sensors.map((d) => d.id);

        const promises: Promise<SensorDataSelectType[]>[] = [];
        for (let i = 0; i < sensorIds.length; i++) {
            const sensorId = sensorIds[i];

            promises.push(
                findAndMark(
                    {
                        sensorId,
                        start: startDate,
                        end: endDate,
                        type: "peak",
                    },
                    1.2,
                ),
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
                {
                    startDate,
                    endDate,
                    req,
                },
                err,
            ),
        );
        return;
    }
};
