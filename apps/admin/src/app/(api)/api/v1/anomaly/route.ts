import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/env.mjs";
import {AggregationType} from "@energyleaf/lib";
import {getEnergyDataForSensor} from "../../../../../../../web/src/query/energy";
import ConsumptionData from "../../../../../../../web/src/types/consumption/consumption-data";
import {getAllUsers} from "@/query/user";
import {getSensorsByUser} from "@/query/sensor";
import {isNoticeableEnergyConsumption} from "@/actions/energy-monitoring";

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
            let energyData : any[] = [];

            for (const sensor of sensors) {
                energyData = energyData.concat(await getEnergyDataForSensor(start, end, sensor.id, AggregationType.RAW));
            }

            const data: ConsumptionData[] = energyData.map((entry) => ({
                sensorId: entry.sensorId || 0,
                energy: entry.value,
                timestamp: entry.timestamp.toString(),
            }));

            if (isNoticeableEnergyConsumption(data)) {
                await sendAnomalyMail();
            }
        }

        return NextResponse.json({ status: 200, statusMessage: "Anomaly mails created and sent" });
    } catch (e) {
        return NextResponse.json({ status: 500, statusMessage: "Internal Server Error" });
    }
};
