import { toZonedTime } from "date-fns-tz";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TimezoneTypeToTimeZone } from "@/lib/enums";
import { db } from "@/server/db";
import { userTable } from "@/server/db/tables/user";
import { getSensorIdFromSensorToken } from "@/server/queries/sensor";

const gasRequestDataSchema = z.object({
	value: z.number(),
	date: z.coerce.date().optional(),
});

export const POST = async (req: NextRequest) => {
	const body = req.body;
	if (!req.headers.has("authorization") || req.headers.get("authorization")?.startsWith("Bearer ")) {
		return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
	}
	const accessToken = req.headers.get("authorization")?.split(" ")[1] || "";
	if (!body) {
		return NextResponse.json(
			{ status: 400, statusMessage: "No body" },
			{
				status: 400,
			},
		);
	}
	const rawData = await req.json();
	const check = gasRequestDataSchema.safeParse(rawData);
	if (!check.success) {
		return NextResponse.json({ status: 400, statusMessage: "Invalid data" }, { status: 400 });
	}
	const data = check.data;
	console.info(data);

	if (data.value <= 0) {
		return NextResponse.json(
			{ status: 400, statusMessage: "Value is equal to or less than zero" },
			{ status: 400 },
		);
	}

	try {
		const sensor = await getSensorIdFromSensorToken(accessToken);
		if (!sensor.userId) {
			throw new Error("sensor/no-user");
		}
		const users = await db
			.select({
				tz: userTable.timezone,
			})
			.from(userTable)
			.where(eq(userTable.id, sensor.userId));
		if (users.length === 0) {
			throw new Error("sensor/no-user");
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
			timestamp: tzDate,
		};

		console.log(inputData);

		return NextResponse.json({ status: 200 }, { status: 200 });
	} catch (e) {
		console.error(e);
		if ((e as unknown as Error).message === "token/expired") {
			return NextResponse.json({ statusMessage: "Token expired", status: 401 }, { status: 401 });
		}

		if ((e as unknown as Error).message === "token/invalid") {
			return NextResponse.json({ statusMessage: "Token invalid", status: 401 }, { status: 401 });
		}

		if ((e as unknown as Error).message === "token/not-found") {
			return NextResponse.json({ statusMessage: "Token not found", status: 401 }, { status: 401 });
		}

		if (
			(e as unknown as Error).message === "sensor/not-found" ||
			(e as unknown as Error).message === "sensor/no-user"
		) {
			return NextResponse.json({ statusMessage: "Sensor not found", status: 404 }, { status: 404 });
		}

		return NextResponse.json({ statusMessage: "Database error", status: 500 }, { status: 500 });
	}
};
