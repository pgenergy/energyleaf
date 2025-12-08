import { env } from "@/env";
import { db } from "@/server/db";
import { sensorTable } from "@/server/db/tables/sensor";
import { isNotNull, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(req: NextRequest) {
	const secret = env.CRON_SECRET;
	if (!req.headers.has("authorization") || req.headers.get("authorization") !== `Bearer ${secret}`) {
		return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
	}

	const users = await db.select().from(sensorTable).where(isNotNull(sensorTable.userId));
	const now = new Date();
	const start = new Date(now);
	const end = new Date(now);

	if (start.getMinutes() < 30) {
		start.setHours(start.getHours() - 1, 30, 0, 0);
		end.setHours(end.getHours() - 1, 59, 59, 999);
	} else {
		start.setHours(start.getHours(), 0, 0, 0);
		end.setHours(end.getHours(), 29, 59, 999);
	}

	const promises = [];
	for (const user of users) {
		const data = {
			sensor: user.id,
			start: start.toISOString(),
			end: end.toISOString(),
		};
		promises.push(
			db.execute(sql`SELECT * FROM pgmq.send(queue_name => 'peaks_queue', msg => '${JSON.stringify(data)}')`),
		);
	}

	await Promise.allSettled(promises);
	return NextResponse.json({ statusMessage: "OK" });
}

const anomaliesSchema = z.object({
	msg_id: z.coerce.number(),
	read_ct: z.coerce.number(),
	message: z.string(),
});

const anomaliesMessageSchema = z.object({
	sensor: z.string(),
	start: z.coerce.date(),
	end: z.coerce.date(),
});

export async function POST(req: NextRequest) {
	const secret = env.CRON_SECRET;
	if (!req.headers.has("authorization") || req.headers.get("authorization") !== `Bearer ${secret}`) {
		return NextResponse.json({ status: 401, statusMessage: "Unauthorized" }, { status: 401 });
	}

	const rawData = await req.json();

	const { success: dataSuccess, data } = anomaliesSchema.safeParse(rawData);
	if (!dataSuccess || !data) {
		return NextResponse.json({ status: 400, statusMessage: "Invalid request body" }, { status: 400 });
	}

	const { success: msgSuccess, data: message } = anomaliesMessageSchema.safeParse(data.message);
	if (!msgSuccess || !message) {
		return NextResponse.json({ status: 400, statusMessage: "Invalid message" }, { status: 400 });
	}

	// process message

	try {
		await db.execute(sql`SELECT pgmq.delete('anomalies_queue' ${data.msg_id})`);
	} catch (err) {
		console.error(err);
	}

	return NextResponse.json({ statusMessage: "OK", status: 200 }, { status: 200 });
}
