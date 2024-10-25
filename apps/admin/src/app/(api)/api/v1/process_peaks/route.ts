import { env } from "@/env.mjs";
import { log, logError } from "@energyleaf/postgres/query/logs";
import { findAndMark } from "@energyleaf/postgres/query/peaks";
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
        const checkStart = new Date();
        const checkEnd = new Date();
        if (checkStart.getMinutes() >= 30) {
            checkStart.setHours(checkStart.getHours(), 0, 0, 0);
            checkEnd.setHours(checkEnd.getHours(), 30, 0, 0);
        } else {
            checkStart.setHours(checkStart.getHours() - 1, 30, 0, 0);
            checkEnd.setHours(checkEnd.getHours(), 0, 0, 0);
        }
        const result = await findAndMark(
            {
                sensorId,
                type: "peak",
                start: checkStart,
                end: checkEnd,
            },
            5,
        );
        startDate = result.start;
        endDate = result.end;
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
