import { NextResponse, type NextRequest } from "next/server";
import { isNoticeableEnergyConsumption } from "@/actions/energy-monitoring";
import { env } from "@/env.mjs";
import { getSensorsByUser, getAnomaliesByUser } from "@/query/sensor";
import { getAllUsers } from "@/query/user";

import type { ConsumptionData } from "@energyleaf/lib";
import { AggregationType } from "@energyleaf/lib";
import { sendAnomalyEmail } from "@energyleaf/mail";

export const POST = async (req: NextRequest) => {
    const reportApiKey = env.REPORTS_API_KEY;
    if (!req.headers.has("Authorization") || req.headers.get("Authorization") !== reportApiKey) {
        return NextResponse.json({ status: 401, statusMessage: "Unauthorized" });
    }

    const start = new Date(new Date().setHours(0, 0, 0, 0));
    const end = new Date(new Date().setHours(23, 59, 59, 999));

    try {
        const users = await getAllUsers();
        for (const user of users) {

            const qqq = await getAnomaliesByUser(user.id, start, end);

            if (qqq.length == 0) {
                continue;
            }

            await sendAnomalyEmail({
                to: user.email,
                name: user.username,
                from: env.RESEND_API_MAIL,
                apiKey: env.RESEND_API_KEY,
                unsubscribeLink: "",
                link: "",
            });
        }

        return NextResponse.json({ status: 200, statusMessage: "Anomaly mails created and sent" });
    } catch (e) {
        return NextResponse.json({ status: 500, statusMessage: "Internal Server Error" });
    }
};
