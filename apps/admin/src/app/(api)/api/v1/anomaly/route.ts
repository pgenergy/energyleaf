import { env } from "@/env.mjs";
import { buildUnsubscribeUrl } from "@energyleaf/lib";
import { sendAnomalyEmail } from "@energyleaf/mail";
import { log, logError, trackAction } from "@energyleaf/postgres/query/logs";
import { findAndMark } from "@energyleaf/postgres/query/peaks";
import { createToken, getUsersWhoRecieveAnomalyMail } from "@energyleaf/postgres/query/user";
import { waitUntil } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

export const GET = async (req: NextRequest) => {
    const cronSecret = env.CRON_SECRET;
    if (!req.headers.has("authorization") || req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
        waitUntil(log("request-unauthorized/missing-key", "error", "anomaly-check", "api", req));
        return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
    }

    try {
        const now = new Date();
        waitUntil(trackAction("all-users/start-anomalies-check", "anomaly-check", "api", { timestamp: now }));
        const userData = await getUsersWhoRecieveAnomalyMail();
        const promises: Promise<void>[] = [];
        for (const data of userData) {
            const { user, sensor } = data;
            const fn = async () => {
                let startDate: Date | null = null;
                let endDate: Date | null = null;
                try {
                    const result = await findAndMark(
                        {
                            sensorId: sensor.id,
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
                            waitUntil(
                                trackAction("mail-sent", "anomaly-check", "api", {
                                    userId: user.id,
                                    email: user.email,
                                    link,
                                    unsubscribeLink,
                                }),
                            );
                        }
                    }
                } catch (err) {
                    waitUntil(
                        logError(
                            "anomaly-check/failed",
                            "anomaly-check",
                            "api",
                            {
                                userId: user.id,
                                sensorId: sensor.id,
                                start: startDate,
                                end: endDate || now,
                                type: "anomaly",
                            },
                            err,
                        ),
                    );
                }
            };
            promises.push(fn());
        }
        await Promise.allSettled(promises);
        return NextResponse.json({ statusMessage: "Anomaly mails created and sent" });
    } catch (e) {
        waitUntil(logError("unhandled-crash/failed-in-process-not-finished", "anomaly-check", "api", req, e));
        return NextResponse.json({ statusMessage: "Internal Server Error" }, { status: 500 });
    }
};
