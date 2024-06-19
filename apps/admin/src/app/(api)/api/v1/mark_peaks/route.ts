import { env } from "@/env.mjs";
import { findAndMarkPeaks, getAllSensors } from "@energyleaf/db/query";
import { type NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    const reportApiKey = env.CRON_SECRET;
    if (!req.headers.has("Authorization") || req.headers.get("Authorization") !== reportApiKey) {
        return NextResponse.json({ status: 401, statusMessage: "Unauthorized" });
    }

    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 2, 0, 0, 0);
    const endDate = new Date();
    endDate.setHours(endDate.getHours() - 2, 59, 59, 999);

    try {
        const sensors = await getAllSensors(true);
        const sensorIds = sensors.map((d) => d.id);

        const promises: Promise<void>[] = [];
        for (let i = 0; i < sensorIds.length; i++) {
            const sensorId = sensorIds[i];

            promises.push(
                findAndMarkPeaks({
                    sensorId,
                    start: startDate,
                    end: endDate,
                }),
            );
        }

        await Promise.all(promises);
    } catch (err) {
        return;
    }
};
