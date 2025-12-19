import { waitUntil } from "@vercel/functions";
import { toZonedTime } from "date-fns-tz";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TimezoneTypeToTimeZone } from "@/lib/enums";
import { ErrorTypes, LogSystemTypes } from "@/lib/log-types";
import { db } from "@/server/db";
import { userTable } from "@/server/db/tables/user";
import { logError, logSystem } from "@/server/queries/logs";
import { getSensorIdFromSensorToken, insertEnergyData } from "@/server/queries/sensor";

enum EnergyDataSensorType {
	DIGITAL = 0,
	ANALOG = 1,
}

const energyRequestDataSchema = z.object({
	value: z.number(),
	value_out: z.number().optional(),
	value_current: z.number().optional(),
	date: z.coerce.date().optional(),
	sensor_type: z.enum(EnergyDataSensorType),
});

export const POST = async (req: NextRequest) => {
	const body = req.body;
	if (!req.headers.has("authorization") || !req.headers.get("authorization")?.startsWith("Bearer ")) {
		waitUntil(
			logSystem({
				fn: LogSystemTypes.ENERGY_INPUT_V2,
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
	if (!body) {
		waitUntil(
			logSystem({
				fn: LogSystemTypes.ENERGY_INPUT_V2,
				details: {
					sensor: null,
					user: null,
					reason: ErrorTypes.INVALID_INPUT,
				},
			}),
		);
		return NextResponse.json(
			{ status: 400, statusMessage: "No body", success: false },
			{
				status: 400,
			},
		);
	}
	const rawData = await req.json();
	const check = energyRequestDataSchema.safeParse(rawData);
	if (!check.success) {
		waitUntil(
			logSystem({
				fn: LogSystemTypes.ENERGY_INPUT_V2,
				details: {
					sensor: null,
					user: null,
					reason: ErrorTypes.INVALID_INPUT,
					rawData,
				},
			}),
		);
		return NextResponse.json({ status: 400, statusMessage: "Invalid data", success: false }, { status: 400 });
	}
	const data = check.data;
	console.info(data);

	if (data.value <= 0) {
        if (data.sensor_type === EnergyDataSensorType.ANALOG) {
            return NextResponse.json({ status: 200, success: true }, { status: 200 });
        }
		waitUntil(
			logSystem({
				fn: LogSystemTypes.ENERGY_INPUT_V2,
				details: {
					sensor: null,
					user: null,
					reason: ErrorTypes.INPUT_IS_ZERO,
				},
			}),
		);
		return NextResponse.json(
			{ status: 400, statusMessage: "Value is equal to or less than zero", success: false },
			{ status: 400 },
		);
	}

	try {
		const sensor = await getSensorIdFromSensorToken(accessToken, true);
		const needsSum = data.sensor_type === EnergyDataSensorType.ANALOG;
		if (!sensor.userId) {
			waitUntil(
				logSystem({
					fn: LogSystemTypes.ENERGY_INPUT_V2,
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
					fn: LogSystemTypes.ENERGY_INPUT_V2,
					details: {
						sensor: sensor.id,
						user: null,
						reason: ErrorTypes.USER_NOT_FOUND,
					},
				}),
			);
			return NextResponse.json({ statusMessage: "No user", status: 404, success: false }, { status: 404 });
		}
		let tz = "Europe/Berlin";
		if (users[0].tz) {
			tz = TimezoneTypeToTimeZone[users[0].tz];
		}

		// we set the time to always be in the users timezone
		const date = data.date ? new Date(data.date) : new Date();
		const tzDate = toZonedTime(date, tz);

		const inputData = {
			sensorId: sensor.id,
			value: data.value,
			valueOut: data.value_out,
			valueCurrent: data.value_current,
			sum: needsSum,
			timestamp: tzDate,
		};

		try {
			await insertEnergyData(inputData);
		} catch (e) {
			console.error(e);
			if ((e as unknown as Error).message === "value/too-high") {
				waitUntil(
					logSystem({
						fn: LogSystemTypes.ENERGY_INPUT_V2,
						details: {
							sensor: sensor.id,
							user: sensor.userId,
							reason: ErrorTypes.INPUT_TOO_HIGH,
							data,
						},
					}),
				);
				return NextResponse.json(
					{ statusMessage: "Value too high", status: 400, success: false },
					{ status: 400 },
				);
			}
		}

		return NextResponse.json({ status: 200, success: true }, { status: 200 });
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
				fn: LogSystemTypes.ENERGY_INPUT_V2,
				error: err as unknown as Error,
				details: {
					session: null,
					user: null,
				},
			}),
		);
		return NextResponse.json({ statusMessage: "Database error", status: 500, success: false }, { status: 500 });
	}
};
