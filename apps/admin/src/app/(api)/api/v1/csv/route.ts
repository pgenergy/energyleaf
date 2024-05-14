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
    const { userId, userHash, start, end } = (await req.json()) as Props;

    if (!userId || !userHash) {
        return NextResponse.json(
            {
                error: "Invalid user",
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
                error: "Invalid user",
            },
            {
                status: 401,
            },
        );
    }

    const sensorId = await getElectricitySensorIdForUser(userId);
    console.log(sensorId);
    if (!sensorId) {
        return NextResponse.json(
            {
                error: "No sensor found",
            },
            {
                status: 404,
            },
        );
    }

    const startDate = start ? new Date(start) : new Date(0);
    const endDate = end ? new Date(end) : new Date();

    const energyData = await getEnergyForSensorInRange(startDate, endDate, sensorId);
    console.log(energyData);
    const parsedData = energyData.map((e) => [e.value, e.timestamp.toISOString()]);
    console.log(...parsedData);
    const csvData = csv.stringify([["Verbrauch in kwh", "Zeitstempel"], ...parsedData]);

    return new NextResponse(csvData, {
        status: 200,
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename=export_${userId}.csv`,
            "Access-Control-Allow-Origin": "*",
        },
    });
}
