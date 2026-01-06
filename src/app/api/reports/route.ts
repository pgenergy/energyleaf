import { subDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
import { db } from "@/server/db";
import { reportConfigTable, reportsTable } from "@/server/db/tables/reports";
import { energyDataTable, sensorTable } from "@/server/db/tables/sensor";
import { userDataTable, userTable } from "@/server/db/tables/user";
import { generateReport, getDaysBetween, getPreviousReportDay } from "@/server/lib/reports";
import { getSecretKeyUncached } from "@/server/queries/config";
import { getEnergyForSensorInRange } from "@/server/queries/energy";

export async function GET(req: NextRequest) {
	const secretKey = await getSecretKeyUncached();
	if (!secretKey || !req.headers.has("authorization") || req.headers.get("authorization") !== `Bearer ${secretKey}`) {
		return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
	}

	const usersWithConfig = await db
		.select({
			userId: reportConfigTable.userId,
			days: reportConfigTable.days,
			sensorId: sensorTable.id,
			timezone: userTable.timezone,
		})
		.from(reportConfigTable)
		.innerJoin(sensorTable, eq(sensorTable.userId, reportConfigTable.userId))
		.innerJoin(userTable, eq(userTable.id, reportConfigTable.userId))
		.innerJoin(userDataTable, eq(userDataTable.userId, reportConfigTable.userId))
		.where(and(eq(reportConfigTable.reports, true), eq(userTable.isActive, true), eq(userTable.deleted, false)));

	// Filter to users with sensor data in the last 2 days
	const twoDaysAgo = subDays(new Date(), 2);
	const sensorIds = usersWithConfig.map((u) => u.sensorId);

	const sensorsWithRecentData =
		sensorIds.length > 0
			? await db
					.selectDistinct({ sensorId: energyDataTable.sensorId })
					.from(energyDataTable)
					.where(
						and(inArray(energyDataTable.sensorId, sensorIds), gte(energyDataTable.timestamp, twoDaysAgo)),
					)
			: [];

	const sensorsWithDataSet = new Set(sensorsWithRecentData.map((s) => s.sensorId));

	const promises = [];

	for (const user of usersWithConfig) {
		const tz = TimezoneTypeToTimeZone[user.timezone || TimeZoneType.Europe_Berlin];
		const now = toZonedTime(new Date(), tz);
		const currentDayOfWeek = now.getDay();

		const configuredDays = (user.days || []) as number[];
		if (configuredDays.length === 0 || !configuredDays.includes(currentDayOfWeek)) {
			continue;
		}

		if (!sensorsWithDataSet.has(user.sensorId)) {
			continue;
		}

		const previousReportDay = getPreviousReportDay(currentDayOfWeek, configuredDays);
		if (previousReportDay === null) {
			continue;
		}

		const daysBack = getDaysBetween(currentDayOfWeek, previousReportDay);

		const start = new Date(now);
		start.setDate(start.getDate() - daysBack);
		start.setHours(0, 0, 0, 0);

		const end = new Date(now);
		end.setDate(end.getDate() - 1);
		end.setHours(23, 59, 59, 999);

		if (start > end) {
			continue;
		}

		const data = JSON.stringify({
			userId: user.userId,
			sensorId: user.sensorId,
			start: start.toISOString(),
			end: end.toISOString(),
		});

		promises.push(db.execute(sql`SELECT * FROM pgmq.send(queue_name => 'reports_queue', msg => ${data}::jsonb)`));
	}

	await Promise.allSettled(promises);
	return NextResponse.json({ statusMessage: "OK" });
}

const reportsSchema = z.object({
	msg_id: z.coerce.number(),
	read_ct: z.coerce.number(),
	message: z.object({
		userId: z.string(),
		sensorId: z.string(),
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

	const { success: dataSuccess, data } = reportsSchema.safeParse(rawData);
	if (!dataSuccess || !data) {
		return NextResponse.json({ status: 400, statusMessage: "Invalid request body" }, { status: 400 });
	}

	const { userId, sensorId, start, end } = data.message;

	try {
		const energyData = await getEnergyForSensorInRange(
			start.toISOString(),
			end.toISOString(),
			sensorId,
			"day",
			"sum",
		);

		if (energyData.length === 0) {
			await db.execute(sql`SELECT pgmq.delete('reports_queue'::text, ${data.msg_id}::bigint)`);
			return NextResponse.json({ statusMessage: "No energy data", status: 200 }, { status: 200 });
		}

		const userDataResults = await db.select().from(userDataTable).where(eq(userDataTable.userId, userId)).limit(1);

		const userData = userDataResults[0];

		if (!userData || userData.workingPrice == null || userData.basePrice == null) {
			await db.execute(sql`SELECT pgmq.delete('reports_queue'::text, ${data.msg_id}::bigint)`);
			return NextResponse.json({ statusMessage: "No pricing data", status: 200 }, { status: 200 });
		}

		const report = generateReport({
			dayData: energyData.map((d) => ({
				timestamp: d.timestamp,
				consumption: d.consumption,
			})),
			userData,
			startDate: start,
			endDate: end,
		});

		if (report) {
			await db.insert(reportsTable).values({
				userId,
				data: report,
			});
		}

		await db.execute(sql`SELECT pgmq.delete('reports_queue'::text, ${data.msg_id}::bigint)`);

		return NextResponse.json({ statusMessage: "OK", status: 200 }, { status: 200 });
	} catch (err) {
		console.error("Error processing report:", err);

		try {
			await db.execute(sql`SELECT pgmq.delete('reports_queue'::text, ${data.msg_id}::bigint)`);
		} catch (deleteErr) {
			console.error("Error deleting queue message:", deleteErr);
		}

		return NextResponse.json({ statusMessage: "Error processing report", status: 500 }, { status: 500 });
	}
}
