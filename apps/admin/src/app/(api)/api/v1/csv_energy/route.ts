import { createHash } from "node:crypto";
import { env } from "@/env.mjs";
import { getEnergyForSensorInRange } from "@energyleaf/postgres/query/energy-get";
import { log, logError, trackAction } from "@energyleaf/postgres/query/logs";
import { getElectricitySensorIdForUser } from "@energyleaf/postgres/query/sensor";
import { waitUntil } from "@vercel/functions";
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
        const details = {
            userId,
            userHash,
            start,
            end,
        };
        if (!userId || !userHash) {
            waitUntil(log("user/missing-user-id-or-user-hash", "error", "csv-export", "api", details));
            return NextResponse.json(
                {
                    error: "Sie haben keinen Zugriff.",
                },
                {
                    status: 401,
                },
            );
        }

        const hash = createHash("sha256").update(`${userId}${env.HASH_SECRET}`).digest("hex");
        if (hash !== userHash) {
            waitUntil(log("user/invalid-user-hash", "error", "csv-export", "api", details));
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
            waitUntil(logError("user/no-sensor-found", "csv-export", "api", { detailsObj: details, sensorId }, err));

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
            const parsedData = energyData.map((e) => [
                e.value,
                e.consumption,
                e.valueOut,
                e.inserted,
                e.valueCurrent,
                e.timestamp.toISOString(),
            ]);
            const csvData = csv.stringify([
                [
                    "Zählerstand (Verbraucht)",
                    "Verbrauch in kWh",
                    "Zählerstand (Eingespeißt)",
                    "Erzeugt in kWh",
                    "Leistung in Watt",
                    "Zeitstempel",
                ],
                ...parsedData,
            ]);

            waitUntil(
                trackAction("csv-export/success", "csv-export", "api", { details, startDate, endDate, sensorId }),
            );

            return new NextResponse(csvData, {
                status: 200,
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename=export_${userId}_${new Date().getTime()}.csv`,
                    "Access-Control-Allow-Origin": "*",
                },
            });
        } catch (err) {
            waitUntil(logError("csv-export/failed", "csv-export", "api", { details }, err));

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
        waitUntil(logError("csv-export/failed", "csv-export", "api", req, err));

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
