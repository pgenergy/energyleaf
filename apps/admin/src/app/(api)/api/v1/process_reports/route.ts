import { join } from "node:path";
import { env } from "@/env.mjs";
import { createReportData, sendReportMail } from "@/lib/reports/send-reports";
import { type ReportProps, buildUnsubscribeUrl } from "@energyleaf/lib";
import type { Versions } from "@energyleaf/lib/versioning";
import { log, logError } from "@energyleaf/postgres/query/logs";
import { saveReport, updateLastReportTimestamp } from "@energyleaf/postgres/query/report";
import { createToken } from "@energyleaf/postgres/query/user";
import { waitUntil } from "@vercel/functions";
import { registerFont } from "canvas";
import { type NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

interface User {
    userId: string;
    userName: string;
    appVersion: Versions;
    email: string;
    receiveMails: boolean;
    interval: number;
}

interface ReqBody {
    secret: string;
    user: User;
}

const fn = async (userWithDueReport: User) => {
    registerFont(join(process.cwd(), "/fonts/ARIAL.TTF"), { family: "Arial" });
    let reportProps: ReportProps | null = null;
    let unsubscribeLink = "";
    try {
        reportProps = await createReportData(userWithDueReport);
        const unsubscribeToken = await createToken(userWithDueReport.userId);
        unsubscribeLink = buildUnsubscribeUrl({ baseUrl: env.NEXT_PUBLIC_APP_URL, token: unsubscribeToken });
    } catch (e) {
        logError("create-reports/failed", "reports", "api", { userWithDueReport, reportProps, unsubscribeLink }, e);
        return;
    }

    if (userWithDueReport.receiveMails) {
        try {
            await sendReportMail(userWithDueReport, reportProps, unsubscribeLink);
        } catch (e) {
            logError("send-reports/failed", "reports", "api", { userWithDueReport, reportProps, unsubscribeLink }, e);
            return;
        }
    }

    try {
        await saveReport(reportProps, userWithDueReport.userId);
    } catch (e) {
        logError("save-reports-in-db/failed", "reports", "api", { userWithDueReport, reportProps, unsubscribeLink }, e);
        return;
    }

    try {
        await updateLastReportTimestamp(userWithDueReport.userId);
    } catch (e) {
        logError(
            "update-last-reports-timestamp/failed",
            "reports-creation",
            "api",
            { userWithDueReport, reportProps, unsubscribeLink },
            e,
        );
    }
};

export const POST = async (req: NextRequest) => {
    const cronSecret = env.CRON_SECRET;
    const body = (await req.json()) as ReqBody;

    if (body.secret !== cronSecret) {
        waitUntil(log("request-unauthorized/missing-key", "error", "reports-creation", "api", req));
        return NextResponse.json({ status: 401, statusMessage: "Unauthorized" });
    }

    waitUntil(fn(body.user));
    return NextResponse.json({ statusMessage: "Report creation sucessful" });
};
