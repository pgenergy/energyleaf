import { waitUntil } from "@vercel/functions";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { ErrorTypes, LogSystemTypes } from "@/lib/log-types";
import { db } from "@/server/db";
import { userTable } from "@/server/db/tables/user";
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
	const accessToken = req.headers.get("Authorization")?.split(" ")[1] || "";
	try {
		const sensor = await getSensorIdFromSensorToken(accessToken, true);
		if (!sensor.userId) {
			waitUntil(
				logSystem({
					fn: LogSystemTypes.DATA_GET_V2,
					details: {
						sensor: sensor.id,
						user: null,
						reason: ErrorTypes.USER_NOT_FOUND,
					},
				}),
			);
			return NextResponse.json(
				{ statusMessage: "No user assigned", status: 404, success: false },
				{ status: 404 },
			);
		}
		const users = await db
			.select({
				tz: userTable.timezone,
			})
			.from(userTable)
			.where(eq(userTable.id, sensor.userId));
		if (users.length === 0) {
			waitUntil(
				logSystem({
					fn: LogSystemTypes.DATA_GET_V2,
					details: {
						sensor: sensor.id,
						user: null,
						reason: ErrorTypes.USER_NOT_FOUND,
					},
				}),
			);
			return NextResponse.json({ statusMessage: "No user", status: 404, success: false }, { status: 404 });
		}

		const lastEntry = await getEnergyLastEntry(sensor.id);
		if (!lastEntry) {
			return NextResponse.json({ statusMessage: "No data found", status: 404, success: false }, { status: 404 });
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
