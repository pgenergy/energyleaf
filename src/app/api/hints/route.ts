import { startOfDay, subDays } from "date-fns";
import { and, eq, gte, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/env";
import { MIN_DATA_DAYS } from "@/lib/hints";
import { db } from "@/server/db";
import { hintConfigTable, hintsTable } from "@/server/db/tables/hints";
import { energyDataTable, sensorTable } from "@/server/db/tables/sensor";
import { userTable } from "@/server/db/tables/user";
import { generateHintForUser } from "@/server/lib/hints";
import { getSecretKeyUncached } from "@/server/queries/config";

export async function GET(req: NextRequest) {
	const secretKey = await getSecretKeyUncached();
	if (!secretKey || !req.headers.has("authorization") || req.headers.get("authorization") !== `Bearer ${secretKey}`) {
		return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
	}

	const experimentMode = !env.DISABLE_EXPERIMENT;
	if (!experimentMode) {
		return NextResponse.json({
			statusMessage: "Hints disabled (experiment mode off)",
			queued: 0,
			skipped: 0,
			total: 0,
		});
	}

	const today = startOfDay(new Date());

	const usersWithSensors = await db
		.select({
			userId: userTable.id,
			sensorId: sensorTable.id,
			timezone: userTable.timezone,
			hintsEnabled: hintConfigTable.hintsEnabled,
		})
		.from(userTable)
		.innerJoin(sensorTable, eq(sensorTable.userId, userTable.id))
		.leftJoin(hintConfigTable, eq(hintConfigTable.userId, userTable.id))
		.where(and(eq(userTable.isActive, true), eq(userTable.deleted, false)));

	const promises = [];
	let queued = 0;
	let skipped = 0;

	for (const user of usersWithSensors) {
		if (user.hintsEnabled === false) {
			skipped++;
			continue;
		}

		const existingHint = await db
			.select({ id: hintsTable.id })
			.from(hintsTable)
			.where(and(eq(hintsTable.userId, user.userId), gte(hintsTable.forDate, today)))
			.limit(1);

		if (existingHint.length > 0) {
			skipped++;
			continue;
		}

		const minDataDate = subDays(new Date(), MIN_DATA_DAYS);
		const dataCount = await db
			.select({ count: sql<number>`count(distinct date_trunc('day', ${energyDataTable.timestamp}))` })
			.from(energyDataTable)
			.where(and(eq(energyDataTable.sensorId, user.sensorId), gte(energyDataTable.timestamp, minDataDate)));

		const dayCount = dataCount[0]?.count ?? 0;
		if (dayCount < MIN_DATA_DAYS) {
			skipped++;
			continue;
		}

		const data = JSON.stringify({
			userId: user.userId,
			sensorId: user.sensorId,
			timezone: user.timezone,
		});

		promises.push(db.execute(sql`SELECT * FROM pgmq.send(queue_name => 'hints_queue', msg => ${data}::jsonb)`));
		queued++;
	}

	await Promise.allSettled(promises);

	return NextResponse.json({
		statusMessage: "OK",
		queued,
		skipped,
		total: usersWithSensors.length,
	});
}

const hintsSchema = z.object({
	msg_id: z.coerce.number(),
	read_ct: z.coerce.number(),
	message: z.object({
		userId: z.string(),
		sensorId: z.string(),
		timezone: z.string().nullable().optional(),
	}),
});

/**
 * POST /api/hints
 * Process queued hint generation tasks
 */
export async function POST(req: NextRequest) {
	const secretKey = await getSecretKeyUncached();
	if (!secretKey || !req.headers.has("authorization") || req.headers.get("authorization") !== `Bearer ${secretKey}`) {
		return NextResponse.json({ status: 401, statusMessage: "Unauthorized" }, { status: 401 });
	}

	const rawData = await req.json();

	const { success: dataSuccess, data } = hintsSchema.safeParse(rawData);
	if (!dataSuccess || !data) {
		return NextResponse.json({ status: 400, statusMessage: "Invalid request body" }, { status: 400 });
	}

	const { userId, sensorId, timezone } = data.message;

	// Process hint generation
	const generated = await generateHintForUser({
		userId,
		sensorId,
		timezone,
	});

	// Delete the queue message only on success
	try {
		await db.execute(sql`SELECT pgmq.delete('hints_queue'::text, ${data.msg_id}::bigint)`);
	} catch (err) {
		console.error("Error deleting queue message:", err);
	}

	return NextResponse.json({
		statusMessage: generated ? "Hint generated" : "No hint generated",
		status: 200,
		generated,
	});
}
