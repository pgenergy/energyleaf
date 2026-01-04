import { toZonedTime } from "date-fns-tz";
import { eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TimezoneTypeToTimeZone, TimeZoneType } from "@/lib/enums";
import { db } from "@/server/db";
import { reportConfigTable } from "@/server/db/tables/reports";
import { sensorTable } from "@/server/db/tables/sensor";
import { userTable } from "@/server/db/tables/user";
import { findAndMark } from "@/server/lib/peaks";
import { getSecretKeyUncached } from "@/server/queries/config";

export async function GET(req: NextRequest) {
	const secretKey = await getSecretKeyUncached();
	if (!secretKey || !req.headers.has("authorization") || req.headers.get("authorization") !== `Bearer ${secretKey}`) {
		return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
	}

	const users = await db
		.select({
			userId: reportConfigTable.userId,
			sensorId: sensorTable.id,
			timezone: userTable.timezone,
		})
		.from(reportConfigTable)
		.innerJoin(sensorTable, eq(sensorTable.userId, reportConfigTable.userId))
		.innerJoin(userTable, eq(userTable.id, reportConfigTable.userId))
		.where(eq(reportConfigTable.anomaly, true));

	const promises = [];
	for (const user of users) {
		const tz = TimezoneTypeToTimeZone[user.timezone || TimeZoneType.Europe_Berlin];
		const now = toZonedTime(new Date(), tz);
		const start = new Date(now);
		const end = new Date(now);

		if (start.getMinutes() < 30) {
			start.setHours(start.getHours() - 1, 30, 0, 0);
			end.setHours(end.getHours() - 1, 59, 59, 999);
		} else {
			start.setHours(start.getHours(), 0, 0, 0);
			end.setHours(end.getHours(), 29, 59, 999);
		}

		const data = JSON.stringify({
			user: user.userId,
			sensor: user.sensorId,
			start: start.toISOString(),
			end: end.toISOString(),
		});
		promises.push(db.execute(sql`SELECT * FROM pgmq.send(queue_name => 'anomalies_queue', msg => ${data}::jsonb)`));
	}

	await Promise.allSettled(promises);
	return NextResponse.json({ statusMessage: "OK" });
}

const anomaliesSchema = z.object({
	msg_id: z.coerce.number(),
	read_ct: z.coerce.number(),
	message: z.object({
		user: z.string(),
		sensor: z.string(),
		start: z.coerce.date(),
		end: z.coerce.date(),
	}),
});

export async function POST(req: NextRequest) {
	const secretKey = await getSecretKeyUncached();
	if (!secretKey || !req.headers.has("authorization") || req.headers.get("authorization") !== `Bearer ${secretKey}`) {
		return NextResponse.json({ status: 401, statusMessage: "Unauthorized" }, { status: 401 });
	}

	const rawData = await req.json();

	const { success: dataSuccess, data } = anomaliesSchema.safeParse(rawData);
	if (!dataSuccess || !data) {
		return NextResponse.json({ status: 400, statusMessage: "Invalid request body" }, { status: 400 });
	}

	// process message
	await findAndMark(
		{
			sensorId: data.message.sensor,
			start: data.message.start,
			end: data.message.end,
			type: "anomaly",
		},
		1000,
	);

	try {
		await db.execute(sql`SELECT pgmq.delete('anomalies_queue'::text, ${data.msg_id}::bigint)`);
	} catch (err) {
		console.error(err);
	}

	return NextResponse.json({ statusMessage: "OK", status: 200 }, { status: 200 });
}
