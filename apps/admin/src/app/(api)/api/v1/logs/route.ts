import { env } from "@/env.mjs";
import { getActionSession } from "@/lib/auth/auth.action";
import { logError, trackAction } from "@energyleaf/db/query";
import { waitUntil } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    const apiKey = env.CRON_SECRET;
    const { session, user } = await getActionSession();

    if (!session || !req.headers.has("authorization") || req.headers.get("authorization") !== `Bearer ${apiKey}`) {
        waitUntil(
            logError(
                "request-unauthorized/missing-authorization-header",
                "logs-route",
                "api",
                {
                    session,
                    user,
                    apiKey,
                },
                new Error("Missing authorization header"),
            ),
        );
        return NextResponse.json({ status: 401, statusMessage: "Unauthorized" });
    }

    if (!req.body) {
        waitUntil(
            logError(
                "request-invalid/missing-body",
                "logs-route",
                "api",
                { user, session, apiKey },
                new Error("No body"),
            ),
        );
        return NextResponse.json({ status: 400, statusMessage: "No body" });
    }

    try {
        const data = (await req.json()) as {
            title?: string;
            appFunction?: string;
            appComponent?: "web" | "admin";
            details?: object;
        };

        if (!data.title || !data.appFunction || !data.appComponent || !data.details) {
            waitUntil(
                logError(
                    "request-invalid/invalid-body",
                    "logs-route",
                    "api",
                    { data, user, session, apiKey },
                    new Error("No body"),
                ),
            );
            return NextResponse.json({ status: 400, statusMessage: "Invalid body" });
        }
        data.details = {
            ...data.details,
            userId: user.id,
        };
        waitUntil(trackAction(data.title, data.appFunction, data.appComponent, data.details));
        return NextResponse.json({ status: 200, statusMessage: "log" });
    } catch (e) {
        waitUntil(logError("unhandled-crash/failed-in-process-not-finished", "report-creation", "api", req, e));
        return NextResponse.json({ status: 500, statusMessage: "Internal Server Error" });
    }
};
