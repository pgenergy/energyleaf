import { waitUntil } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";
import { ErrorTypes, LogSystemTypes } from "@/lib/log-types";
import { getEnergyLastEntry } from "@/server/queries/energy";
import { logError, logSystem } from "@/server/queries/logs";
import { getSensorIdFromSensorToken } from "@/server/queries/sensor";

export async function GET(req: NextRequest) {
	if (!req.headers.has("authorization") || !req.headers.get("authorization")?.startsWith("Bearer ")) {
		waitUntil(
			logSystem({
				fn: LogSystemTypes.DATA_GET_V2,
				details: {
					sensor: null,
					user: null,
					reason: ErrorTypes.INVALID_TOKEN,
				},
			}),
		);
		return NextResponse.json({ success: false, statusMessage: "Unauthorized" }, { status: 401 });
	}
	const accessToken = req.headers.get("authorization")?.split(" ")[1] || "";
	try {
		const sensor = await getSensorIdFromSensorToken(accessToken, true);

		let lastEntry = await getEnergyLastEntry(sensor.id);
		if (!lastEntry) {
            lastEntry = {
                id: "",
                sensorId: sensor.id,
                value: 0,
                consumption: 0,
                inserted: 0,
                valueCurrent: 0,
                valueOut: 0,
                timestamp: new Date(),
            };
		}

		if (sensor.script && sensor.script !== "" && !Number.isNaN(sensor.script)) {
			return NextResponse.json({ value: lastEntry.value, rotation: Number(sensor.script) }, { status: 200 });
		} else {
			return NextResponse.json({ value: lastEntry.value }, { status: 200 });
		}
	} catch (err) {
		console.error(err);
		if ((err as unknown as Error).message === "token/expired") {
			return NextResponse.json({ statusMessage: "Token expired", status: 401, success: false }, { status: 401 });
		}

		if ((err as unknown as Error).message === "token/invalid") {
			return NextResponse.json({ statusMessage: "Token invalid", status: 401, success: false }, { status: 401 });
		}

		if ((err as unknown as Error).message === "token/not-found") {
			return NextResponse.json(
				{ statusMessage: "Token not found", status: 401, success: false },
				{ status: 401 },
			);
		}

		if (
			(err as unknown as Error).message === "sensor/not-found" ||
			(err as unknown as Error).message === "sensor/no-user"
		) {
			return NextResponse.json(
				{ statusMessage: "Sensor not found", status: 404, success: false },
				{ status: 404 },
			);
		}

		waitUntil(
			logError({
				fn: LogSystemTypes.DATA_GET_V2,
				error: err as unknown as Error,
				details: {
					session: null,
					user: null,
				},
			}),
		);
		return NextResponse.json({ statusMessage: "Database error", status: 500, success: false }, { status: 500 });
	}
}
