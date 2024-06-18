import { env, getUrl } from "@/env.mjs";
import { getAnomaliesByUser } from "@/query/sensor";
import { getAllUsers } from "@/query/user";
import { sendAnomalyEmail } from "@energyleaf/mail";
import { type NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    const reportApiKey = env.CRON_SECRET;
    if (!req.headers.has("Authorization") || req.headers.get("Authorization") !== reportApiKey) {
        return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
    }

    const start = new Date(new Date().setHours(0, 0, 0, 0));
    const end = new Date(new Date().setHours(23, 59, 59, 999));

    try {
        const users = await getAllUsers();
        for (const user of users) {
            const anomaliesByUser = await getAnomaliesByUser(user.id, start, end);

            if (anomaliesByUser.length === 0) {
                continue;
            }

            await sendAnomalyEmail({
                to: user.email,
                name: user.username,
                from: env.RESEND_API_MAIL,
                apiKey: env.RESEND_API_KEY,
                unsubscribeLink: "",
                link: getUrl(env),
            });
        }

        return NextResponse.json({ statusMessage: "Anomaly mails created and sent" });
    } catch (e) {
        console.log(e);
        return NextResponse.json({ statusMessage: "Internal Server Error" }, { status: 500 });
    }
};
