import { log, logError } from "@energyleaf/db/query";
import { waitUntil } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";
import {env} from "@/env.mjs";
import {getActionSession} from "@/lib/auth/auth.action";

async function addLogToDb(body: ReadableStream<Uint8Array>) {
    log("log", "info", "log", "api", body);
}

export const POST = async (req: NextRequest) => {
    const apiKey = env.CRON_SECRET;
    const {session} = await getActionSession();

    if (!session || !req.headers.has("authorization") || req.headers.get("authorization") !== `Bearer ${apiKey}`) {
        waitUntil(log("request-unauthorized/missing-key", "error", "report-creation", "api", req));
        return NextResponse.json({ status: 401, statusMessage: "Unauthorized" });
    }

    if (!req.body) {
        waitUntil(log("request-unauthorized/missing-body", "error", "log", "api", req));
        return NextResponse.json({ status: 400, statusMessage: "No body" });
    }

    try {
        await addLogToDb(req.body);
        return NextResponse.json({ status: 200, statusMessage: "log" });
    } catch (e) {
        waitUntil(logError("unhandled-crash/failed-in-process-not-finished", "report-creation", "api", req, e));
        return NextResponse.json({ status: 500, statusMessage: "Internal Server Error" });
    }
};
