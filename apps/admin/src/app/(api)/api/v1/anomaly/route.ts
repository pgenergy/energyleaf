import { env, getUrl } from "@/env.mjs";
import { getAnomaliesByUser } from "@/query/sensor";
import { getAllUsers } from "@/query/user";
import { createToken } from "@energyleaf/db/query";
import { log, logError, trackAction } from "@energyleaf/db/query";
import { buildUnsubscribeUrl } from "@energyleaf/lib";
import { sendAnomalyEmail } from "@energyleaf/mail";
import { waitUntil } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    const reportApiKey = env.CRON_SECRET;
    if (!req.headers.has("authorization") || req.headers.get("authorization") !== `Bearer ${reportApiKey}`) {
        waitUntil(log("request-unauthorized/missing-key", "error", "anomaly-check", "api", req));
        return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
    }

    const start = new Date(new Date().setHours(0, 0, 0, 0));
    const end = new Date(new Date().setHours(23, 59, 59, 999));

    try {
        waitUntil(trackAction("all-users/start-anomalies-check", "anomaly-check", "api", { start, end }));
        const users = await getAllUsers();
        for (const user of users) {
            if (!user.receiveAnomalyMails) {
                continue;
            }

            const anomaliesListForUser = await getAnomaliesByUser(user.id, start, end);

            if (anomaliesListForUser.length === 0) {
                continue;
            }

            const link = getUrl(env);
            if (env.RESEND_API_KEY && env.RESEND_API_MAIL) {
                const unsubscribeToken = await createToken(user.id);
                const unsubscribeLink = buildUnsubscribeUrl({ baseUrl: getUrl(env), token: unsubscribeToken });

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

        return NextResponse.json({ statusMessage: "Anomaly mails created and sent" });
    } catch (e) {
        waitUntil(logError("unhandled-crash/failed-in-process-not-finished", "anomaly-check", "api", req, e));
        return NextResponse.json({ statusMessage: "Internal Server Error" }, { status: 500 });
    }
};
