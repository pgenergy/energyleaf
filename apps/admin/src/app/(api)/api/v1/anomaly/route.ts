import { env, getUrl } from "@/env.mjs";
import { getAnomaliesByUser } from "@/query/sensor";
import { getAllUsers } from "@/query/user";
import { createToken } from "@energyleaf/db/query";
import { buildUnsubscribeUrl } from "@energyleaf/lib";
import { sendAnomalyEmail } from "@energyleaf/mail";
import { type NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    const reportApiKey = env.CRON_SECRET;
    if (!req.headers.has("authorization") || req.headers.get("authorization") !== `Bearer ${reportApiKey}`) {
        return NextResponse.json({ status: 401, statusMessage: "Unauthorized" });
    }

    const start = new Date(new Date().setHours(0, 0, 0, 0));
    const end = new Date(new Date().setHours(23, 59, 59, 999));

    try {
        const users = await getAllUsers();
        for (const user of users) {
            const qqq = await getAnomaliesByUser(user.id, start, end);

            if (qqq.length === 0) {
                continue;
            }

            const unsubscribeToken = await createToken(user.id);
            const unsubscribeLink = buildUnsubscribeUrl({ baseUrl: getUrl(env), token: unsubscribeToken });

            await sendAnomalyEmail({
                to: user.email,
                name: user.username,
                from: env.RESEND_API_MAIL,
                apiKey: env.RESEND_API_KEY,
                unsubscribeLink: unsubscribeLink,
                link: getUrl(env),
            });
        }

        return NextResponse.json({ status: 200, statusMessage: "Anomaly mails created and sent" });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ status: 500, statusMessage: "Internal Server Error" });
    }
};
