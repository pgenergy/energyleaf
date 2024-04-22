import { NextResponse, type NextRequest } from "next/server";
import { isNoticeableEnergyConsumption } from "@/actions/energy-monitoring";
import { env } from "@/env.mjs";
import { getSensorsByUser } from "@/query/sensor";
import { getAllUsers } from "@/query/user";

import { getEnergyForSensorInRange } from "@energyleaf/db/query";
import type { ConsumptionData } from "@energyleaf/lib";
import { AggregationType } from "@energyleaf/lib";
import { sendAnomalyEmail } from "@energyleaf/mail";

export const POST = async (req: NextRequest) => {
    const reportApiKey = env.REPORTS_API_KEY;
    if (!req.headers.has("Authorization") || req.headers.get("Authorization") !== reportApiKey) {
        return NextResponse.json({ status: 403, statusMessage: "Forbidden" });
    }

    const start = new Date(new Date().setHours(0, 0, 0, 0));
    const end = new Date(new Date().setHours(23, 59, 59, 999));

    try {
        const users = await getAllUsers();
        for (const user of users) {
            const sensors = await getSensorsByUser(user.id);
            let data: ConsumptionData[] = [];

            for (const sensor of sensors) {
                const energyData = await getEnergyForSensorInRange(start, end, sensor.id, AggregationType.RAW);
                data = data.concat(
                    energyData.map((entry) => ({
                        sensorId: entry.sensorId || 0,
                        energy: entry.value,
                        timestamp: entry.timestamp.toString(),
                    })),
                );
            }

            if (!isNoticeableEnergyConsumption(data)) {
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
