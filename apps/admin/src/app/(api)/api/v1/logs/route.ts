import { env } from "@/env.mjs";
import { lucia } from "@/lib/auth/auth.config";
import { logError, trackAction } from "@energyleaf/db/query";
import { waitUntil } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";

const corsOrigin = env.NEXT_PUBLIC_APP_URL.startsWith("localhost")
    ? `http://${env.NEXT_PUBLIC_APP_URL}`
    : `https://${env.NEXT_PUBLIC_APP_URL}`;
const corsHeaders = {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
};

export const POST = async (req: NextRequest) => {
    const apiKey = env.CRON_SECRET;
    const sessionId = req.cookies.get(lucia.sessionCookieName)?.value || "";
    const { session, user } = await lucia.validateSession(sessionId);

    console.log(sessionId, session, user);

    if (!sessionId && !req.headers.has("authorization") && req.headers.get("authorization") !== `Bearer ${apiKey}`) {
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
        return NextResponse.json(
            { status: 401, statusMessage: "Unauthorized" },
            {
                status: 401,
                headers: {
                    ...corsHeaders,
                },
            },
        );
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
        return NextResponse.json(
            { status: 400, statusMessage: "No body" },
            {
                status: 400,
                headers: {
                    ...corsHeaders,
                },
            },
        );
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
            return NextResponse.json(
                { status: 400, statusMessage: "Invalid body" },
                {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                    },
                },
            );
        }
        data.details = {
            ...data.details,
            userId: user?.id,
            session: session,
        };
        waitUntil(trackAction(data.title, data.appFunction, data.appComponent, data.details));
        return NextResponse.json(
            { status: 200, statusMessage: "log" },
            {
                status: 200,
                headers: {
                    ...corsHeaders,
                },
            },
        );
    } catch (e) {
        waitUntil(logError("unhandled-crash/failed-in-process-not-finished", "report-creation", "api", req, e));
        return NextResponse.json(
            { status: 500, statusMessage: "Internal Server Error" },
            {
                status: 500,
                headers: {
                    ...corsHeaders,
                },
            },
        );
    }
};

export const OPTIONS = async () => {
    return new NextResponse(null, {
        status: 204,
        headers: {
            ...corsHeaders,
        },
    });
};
