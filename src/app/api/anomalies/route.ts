import { env } from "@/env";
import { db } from "@/server/db";
import { reportConfigTable } from "@/server/db/tables/reports";
import { sensorTable } from "@/server/db/tables/sensor";
import { eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(req: NextRequest) {
	const secret = env.CRON_SECRET;
	if (!req.headers.has("authorization") || req.headers.get("authorization") !== `Bearer ${secret}`) {
		return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
	}

	const users = await db
		.select()
		.from(reportConfigTable)
		.innerJoin(sensorTable, eq(sensorTable.userId, reportConfigTable.id))
		.where(eq(reportConfigTable.anomaly, true));

	const promises = [];
	for (const user of users) {
		const data = {
			user: user.report_config.userId,
			sensor: user.sensor.id,
		};
		promises.push(
			db.execute(sql`SELECT * FROM pgmq.send(queue_name => 'anomalies_queue', msg => '${JSON.stringify(data)}')`),
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
	user: z.string(),
	sensor: z.string(),
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
