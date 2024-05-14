import { getElectricitySensorIdForUser, getEnergyForSensorInRange } from "@energyleaf/db/query";
import * as csv from "csv/sync";
import { type NextRequest, NextResponse } from "next/server";

interface Props {
    userId: string;
    userHash: string;
    start?: string;
    end?: string;
}

export async function POST(req: NextRequest) {
    try {
        const { userId, userHash, start, end } = (await req.json()) as Props;

        if (!userId || !userHash) {
            return NextResponse.json(
                {
                    error: "Sie habene keinen Zugriff.",
                },
                {
                    status: 401,
                },
            );
        }

        const base64UserId = Buffer.from(userId).toString("base64url").slice(0, 6);
        if (base64UserId !== userHash) {
            return NextResponse.json(
                {
                    error: "Sie haben keinen Zugriff.",
                },
                {
                    status: 401,
                },
            );
        }

        let sensorId: string | null = null;
        try {
            sensorId = await getElectricitySensorIdForUser(userId);
            if (!sensorId) {
                throw new Error();
            }
        } catch (err) {
            console.error(err);
            return NextResponse.json(
                {
                    error: "Sie haben keinen Sensor.",
                },
                {
                    status: 404,
                },
            );
        }

        const startDate = start ? new Date(start) : new Date(0);
        const endDate = end ? new Date(end) : new Date();

        try {
            const energyData = await getEnergyForSensorInRange(startDate, endDate, sensorId);
            const parsedData = energyData.map((e) => [e.value, e.timestamp.toISOString()]);
            const csvData = csv.stringify([["Verbrauch in kWh", "Zeitstempel"], ...parsedData]);

            return new NextResponse(csvData, {
                status: 200,
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename=export_${userId}.csv`,
                    "Access-Control-Allow-Origin": "*",
                },
            });
        } catch (err) {
            console.error(err);
            return NextResponse.json(
                {
                    error: "Ein Fehler ist aufgetreten.",
                },
                {
                    status: 500,
                },
            );
        }
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            {
                error: "Ein Fehler ist aufgetreten.",
            },
            {
                status: 500,
            },
        );
    }
}
