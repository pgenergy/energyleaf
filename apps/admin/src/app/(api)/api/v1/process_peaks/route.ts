import { classifyAndSaveDevicesForPeaks } from "@/actions/ml";
import { env } from "@/env.mjs";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
import { log, logError } from "@energyleaf/postgres/query/logs";
import { findAndMark, getSequencesBySensor } from "@energyleaf/postgres/query/peaks";
import { getUserBySensorId } from "@energyleaf/postgres/query/user";
import { waitUntil } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

interface ReqBody {
    secret: string;
    sensorId: string;
}

const fn = async (sensorId: string) => {
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
            const peaks = await getSequencesBySensor(sensorId, { start: startDate, end: endDate });

            const peaksToClassify = await Promise.all(
                peaks.map(async (peak) => {
                    return {
                        id: peak.id,
                        electricity: peak.sensorData.map((data) => ({
                            timestamp: data.timestamp.toISOString(),
                            power: data.consumption / 1000,
                        })),
                    };
                }),
            );

            await classifyAndSaveDevicesForPeaks(peaksToClassify, user.userId);
        }
    } catch (err) {
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
        );
    }
};

export const POST = async (req: NextRequest) => {
    const cronSecret = env.CRON_SECRET;
    const body = (await req.json()) as ReqBody;

    if (body.secret !== cronSecret) {
        waitUntil(log("request-unauthorized/missing-key", "error", "mark-peaks", "api", req));
        return NextResponse.json({ status: 401, statusMessage: "Unauthorized" });
    }

    waitUntil(fn(body.sensorId));
    return NextResponse.json({ statusMessage: "Peaks successfully marked and classified where applicable." });
};
