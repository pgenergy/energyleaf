import { createHash } from "node:crypto";
import { env } from "@/env.mjs";
import { getElectricitySensorIdForUser, getEnergyForSensorInRange, log } from "@energyleaf/db/query";
import * as csv from "csv/sync";
import { type NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";

interface Props {
    userId: string;
    userHash: string;
    start?: string;
    end?: string;
}

interface EnergyData {
    value: number;
    timestamp: string;
}

export async function POST(req: NextRequest) {
    try {
        const { userId, userHash, start, end } = (await req.json()) as Props;
        const detailsObj = {
            userId,
            userHash,
            start,
            end,
        };
        const details = JSON.stringify(detailsObj);

        if (!userId || !userHash) {
            waitUntil(
                log(
                    "Kein Zugriff auf CSV Export, weil keine userID oder kein userHash vorhanden ist.k",
                    "error",
                    "api",
                    details,
                ),
            );
            return NextResponse.json(
                {
                    error: "Sie haben keinen Zugriff.",
                },
                {
                    status: 401,
                },
            );
        }

        const hash = createHash("sha256").update(`${userId}${env.NEXTAUTH_SECRET}`).digest("hex");
        if (hash !== userHash) {
            waitUntil(
                log(
                    "Kein Zugriff auf CSV Export, weil der userHash nicht korrekt ist.",
                    "error",
                    "api",
                    details + JSON.stringify({ hash }),
                ),
            );
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
            waitUntil(
                log(
                    "Kein Zugriff auf CSV Export, weil kein Sensor vorhanden ist.",
                    "error",
                    "api",
                    details + JSON.stringify({ sensorId }) + JSON.stringify(err),
                ),
            );

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
            const energyData = (await getEnergyForSensorInRange(startDate, endDate, sensorId)) as EnergyData[];
            const parsedData = energyData.map((e) => [e.value, e.timestamp]);
            const csvData = csv.stringify([["Verbrauch in kWh", "Zeitstempel"], ...parsedData]);

            const logDetails = {
                startDate,
                endDate,
                energyData,
                parsedData,
                csvData,
            };
            waitUntil(log("CSV Export erfolgreich.", "info", "api", details + JSON.stringify(logDetails)));

            return new NextResponse(csvData, {
                status: 200,
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename=export_${userId}_${new Date().getTime()}.csv`,
                    "Access-Control-Allow-Origin": "*",
                },
            });
        } catch (err) {
            console.error(err);
            waitUntil(
                log(
                    "Fehler bei der Ermittlung der Energydata im CSV Export.",
                    "error",
                    "api",
                    details +
                        JSON.stringify({ sensorId }) +
                        JSON.stringify(startDate) +
                        JSON.stringify(endDate) +
                        JSON.stringify(err),
                ),
            );

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
        waitUntil(log("Allgemeiner Fehler beim CSV Export.", "error", "api", JSON.stringify(err)));

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
