import { env } from "@/env.mjs";
import { classifyAndSaveDevicesForPeaks } from "@/query/peak";
import {
    createStandardDevicesIfNotExist,
    findAndMark,
    getAllSensors,
    getSequencesBySensor,
    getUserBySensorId,
    log,
    logError,
} from "@energyleaf/db/query";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
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
        for (let i = 0; i < sensorIds.length; i++) {
            const sensorId = sensorIds[i];

            const fn = async () => {
                let startDate: Date | null = null;
                let endDate: Date | null = null;
                try {
                    const result = await findAndMark(
                        {
                            sensorId,
                            type: "peak",
                        },
                        10,
                    );
                    startDate = result.start;
                    endDate = result.end;

                    if (!startDate || !endDate) {
                        throw new Error("Start date or end date is undefined.");
                    }

                    const user = await getUserBySensorId(sensorId);

                    if (user && fulfills(user.appVersion, Versions.support)) {
                        await createStandardDevicesIfNotExist(user.userId);

                        const peaks = await getSequencesBySensor(sensorId, { start: startDate, end: endDate });

                        const peaksToClassify = await Promise.all(
                            peaks.map(async (peak) => {
                                return {
                                    id: peak.id,
                                    electricity: peak.sensorData.map((data) => ({
                                        timestamp: data.timestamp.toISOString(),
                                        power: data.consumption ?? 0, // Normally shouldn't be null
                                    })),
                                };
                            }),
                        );

                        await classifyAndSaveDevicesForPeaks(peaksToClassify, user.userId);
                    }
                } catch (err) {
                    waitUntil(
                        logError(
                            "mark-peaks/user-error",
                            "mark-peaks",
                            "api",
                            {
                                sensorId,
                                start: startDate?.toISOString(),
                                end: (endDate ?? new Date()).toISOString(),
                            },
                            new Error(err),
                        ),
                    );
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
