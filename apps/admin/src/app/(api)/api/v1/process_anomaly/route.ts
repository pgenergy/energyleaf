import { env } from "@/env.mjs";
import { buildUnsubscribeUrl } from "@energyleaf/lib";
import { sendAnomalyEmail } from "@energyleaf/mail";
import { log, logError, trackAction } from "@energyleaf/postgres/query/logs";
import { findAndMark } from "@energyleaf/postgres/query/peaks";
import { createToken } from "@energyleaf/postgres/query/user";
import { waitUntil } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

interface ReqBody {
    secret: string;
    sensorId: string;
    user: {
        id: string;
        username: string;
        email: string;
    };
}

const fn = async (
    sensorId: string,
    user: {
        id: string;
        username: string;
        email: string;
    },
) => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    try {
        const result = await findAndMark(
            {
                sensorId: sensorId,
                type: "anomaly",
            },
            5000, // set the multiplier to 5000 that must be enough so it wont trigger on normal peaks
        );
        startDate = result.start;
        endDate = result.end;
        if (result.resultCount > 0) {
            const link =
                env.VERCEL_ENV === "production" || env.VERCEL_ENV === "preview"
                    ? `https://${env.NEXT_PUBLIC_APP_URL}`
                    : `http://${env.NEXT_PUBLIC_APP_URL}`;
            if (env.RESEND_API_KEY && env.RESEND_API_MAIL) {
                const unsubscribeToken = await createToken(user.id);
                const unsubscribeLink = buildUnsubscribeUrl({
                    baseUrl: env.NEXT_PUBLIC_APP_URL,
                    token: unsubscribeToken,
                });

                await sendAnomalyEmail({
                    to: user.email,
                    name: user.username,
                    from: env.RESEND_API_MAIL,
                    apiKey: env.RESEND_API_KEY,
                    unsubscribeLink: unsubscribeLink,
                    link: link,
                });
                trackAction("mail-sent", "anomaly-check", "api", {
                    userId: user.id,
                    email: user.email,
                    link,
                    unsubscribeLink,
                });
            }
        }
    } catch (err) {
        logError(
            "anomaly-check/failed",
            "anomaly-check",
            "api",
            {
                userId: user.id,
                sensorId: sensorId,
                start: startDate,
                end: endDate || now,
                type: "anomaly",
            },
            err,
        );
    }
};

export const POST = async (req: NextRequest) => {
    const cronSecret = env.CRON_SECRET;
    const body = (await req.json()) as ReqBody;

    if (body.secret !== cronSecret) {
        waitUntil(log("request-unauthorized/missing-key", "error", "anomaly-check", "api", req));
        return NextResponse.json({ status: 401, statusMessage: "Unauthorized" });
    }

    waitUntil(fn(body.sensorId, body.user));
    return NextResponse.json({ statusMessage: "Anomaly detection successful" });
};
