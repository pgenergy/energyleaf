import { env } from "@/env.mjs";
import { createToken, findAndMark, getUsersWhoRecieveAnomalyMail } from "@energyleaf/db/query";
import { log, logError, trackAction } from "@energyleaf/db/query";
import { buildUnsubscribeUrl } from "@energyleaf/lib";
import { sendAnomalyEmail } from "@energyleaf/mail";
import { waitUntil } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const cronSecret = env.CRON_SECRET;
    if (!req.headers.has("authorization") || req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
        waitUntil(log("request-unauthorized/missing-key", "error", "anomaly-check", "api", req));
        return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
    }

    const start = new Date();
    const end = new Date();

    if (start.getMinutes() >= 30) {
        start.setHours(start.getHours(), 0, 0, 0);
        end.setHours(end.getHours(), 30, 59, 999);
    } else {
        start.setHours(start.getHours() - 1, 30, 0, 0);
        end.setHours(end.getHours() - 1, 59, 59, 999);
    }

    try {
        waitUntil(trackAction("all-users/start-anomalies-check", "anomaly-check", "api", { start, end }));
        const userData = await getUsersWhoRecieveAnomalyMail();
        const promises: Promise<void>[] = [];
        for (const data of userData) {
            const { user, sensor } = data;
            const fn = async () => {
                try {
                    const anomalies = await findAndMark(
                        {
                            sensorId: sensor.id,
                            start,
                            end,
                            type: "anomaly",
                        },
                        1000, // set the multiplier to 1000 that must be enough so it wont trigger on normal peaks
                    );
                    if (anomalies.length > 0) {
                        const link = env.NEXT_PUBLIC_APP_URL.startsWith("localhost")
                            ? `http://${env.NEXT_PUBLIC_APP_URL}`
                            : `https://${env.NEXT_PUBLIC_APP_URL}`;
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
                                sesnorId: sensor.id,
                                start,
                                end,
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
