import { cache } from "react";
import "server-only";
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { reportConfigTable, reportsTable } from "../db/tables/reports";

export const getReportConfig = cache(async (userId: string) => {
	const configs = await db.select().from(reportConfigTable).where(eq(reportConfigTable.userId, userId)).limit(1);

	if (configs.length === 0) {
		return null;
	}

	return configs[0];
});

/**
 * Get the timestamp of the last generated report for a user.
 * Returns null if no report exists.
 */
export async function getLastReportTimestamp(userId: string): Promise<Date | null> {
	const reports = await db
		.select({ timestamp: reportsTable.timestamp })
		.from(reportsTable)
		.where(eq(reportsTable.userId, userId))
		.orderBy(desc(reportsTable.timestamp))
		.limit(1);

	return reports.length > 0 ? reports[0].timestamp : null;
}

interface GetReportsPageParams {
	userId: string;
	page?: number;
	pageSize?: number;
}

/**
 * Get paginated reports for a user.
 */
export async function getReportsPage({ userId, page = 1, pageSize = 10 }: GetReportsPageParams) {
	const safePage = page > 0 ? page : 1;
	const limit = pageSize > 0 ? pageSize : 10;
	const offset = (safePage - 1) * limit;

	const reports = await db
		.select()
		.from(reportsTable)
		.where(eq(reportsTable.userId, userId))
		.orderBy(desc(reportsTable.timestamp))
		.limit(limit)
		.offset(offset);

	const [{ total }] = await db.select({ total: count() }).from(reportsTable).where(eq(reportsTable.userId, userId));

	return {
		reports,
		total,
		page: safePage,
		pageSize: limit,
	};
}

/**
 * Get a single report by ID, ensuring it belongs to the specified user.
 */
export async function getReportById(reportId: string, userId: string) {
	const reports = await db
		.select()
		.from(reportsTable)
		.where(and(eq(reportsTable.id, reportId), eq(reportsTable.userId, userId)))
		.limit(1);

	return reports.length > 0 ? reports[0] : null;
}
