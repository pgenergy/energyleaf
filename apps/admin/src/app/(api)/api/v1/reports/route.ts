export const maxDuration = 300; // This function can run for a maximum of 300 seconds

import { join } from "node:path";
import { env } from "@/env.mjs";
import { createReportsAndSendMails } from "@/lib/reports/send-reports";
import { log, logError } from "@energyleaf/db/query";
import { waitUntil } from "@vercel/functions";
import { registerFont } from "canvas";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const cronSecret = env.CRON_SECRET;
    if (!req.headers.has("authorization") || req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
        waitUntil(log("request-unauthorized/missing-key", "error", "report-creation", "api", req));
        return NextResponse.json({ status: 401, statusMessage: "Unauthorized" });
    }

    try {
        registerFont(join(process.cwd(), "/fonts/ARIAL.TTF"), { family: "Arial" });

        await createReportsAndSendMails();
        return NextResponse.json({ status: 200, statusMessage: "Reports created and sent" });
    } catch (e) {
        waitUntil(logError("unhandled-crash/failed-in-process-not-finished", "report-creation", "api", req, e));
        return NextResponse.json({ status: 500, statusMessage: "Internal Server Error" });
    }
};
