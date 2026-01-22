import "server-only";

import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { cache } from "react";
import { USER_ACTION_TYPES } from "@/lib/log-types";
import { db } from "../db";
import { actionLogsTable, pageViewTable } from "../db/tables/logs";

const actionUserId = sql<string>`(${actionLogsTable.details} ->> 'user')`;
const actionUserFilter = sql`${actionLogsTable.details} ->> 'user' is not null`;

const toUtcDate = (value: string | Date) => {
	if (value instanceof Date) {
		return value;
	}
	return new Date(`${value}+0000`);
};

export interface PageViewOverview {
	total: number;
	uniqueUsers: number;
	uniqueSessions: number;
}

export interface PageViewSeriesPoint {
	date: Date;
	views: number;
	users: number;
}

export interface ActionOverview {
	total: number;
	success: number;
	failed: number;
	uniqueUsers: number;
}

export interface ActionSeriesPoint {
	date: Date;
	success: number;
	failed: number;
	total: number;
}

export interface TopPageView {
	path: string;
	total: number;
	uniqueUsers: number;
}

export interface TopActionType {
	action: string;
	total: number;
	success: number;
	failed: number;
	uniqueUsers: number;
}

export interface PageViewExportRow {
	timestamp: Date | null;
	path: string;
	searchParams: unknown;
	params: unknown;
	userAgent: string | null;
	userId: string | null;
	sessionId: string;
}

export interface ActionExportRow {
	timestamp: Date | null;
	action: string;
	result: string;
	details: unknown;
	userId: string | null;
}

function buildPageViewFilter(start: Date, end: Date, userId?: string | null) {
	const baseFilter = and(gte(pageViewTable.timestamp, start), lte(pageViewTable.timestamp, end));
	if (!userId) {
		return baseFilter;
	}
	return and(baseFilter, eq(pageViewTable.userId, userId));
}

function buildActionFilter(start: Date, end: Date, userId?: string | null) {
	const baseFilter = and(
		inArray(actionLogsTable.function, USER_ACTION_TYPES),
		gte(actionLogsTable.timestamp, start),
		lte(actionLogsTable.timestamp, end),
		actionUserFilter,
	);
	if (!userId) {
		return baseFilter;
	}
	return and(baseFilter, eq(actionUserId, userId));
}

export const getPageViewOverview = cache(
	async (start: Date, end: Date, userId?: string | null): Promise<PageViewOverview> => {
		const [row] = await db
			.select({
				total: sql<number>`count(*)::int`,
				uniqueUsers: sql<number>`count(distinct ${pageViewTable.userId})::int`,
				uniqueSessions: sql<number>`count(distinct ${pageViewTable.session_id})::int`,
			})
			.from(pageViewTable)
			.where(buildPageViewFilter(start, end, userId));

		return (
			row ?? {
				total: 0,
				uniqueUsers: 0,
				uniqueSessions: 0,
			}
		);
	},
);

export const getActionOverview = cache(
	async (start: Date, end: Date, userId?: string | null): Promise<ActionOverview> => {
		const [row] = await db
			.select({
				total: sql<number>`count(*)::int`,
				success: sql<number>`count(*) filter (where ${actionLogsTable.action} = 'success')::int`,
				failed: sql<number>`count(*) filter (where ${actionLogsTable.action} = 'failed')::int`,
				uniqueUsers: sql<number>`count(distinct ${actionUserId})::int`,
			})
			.from(actionLogsTable)
			.where(buildActionFilter(start, end, userId));

		return (
			row ?? {
				total: 0,
				success: 0,
				failed: 0,
				uniqueUsers: 0,
			}
		);
	},
);

export const getPageViewSeries = cache(
	async (start: Date, end: Date, userId?: string | null): Promise<PageViewSeriesPoint[]> => {
		const day = sql`date_trunc('day', ${pageViewTable.timestamp})`;
		return db
			.select({
				date: day.mapWith(toUtcDate),
				views: sql<number>`count(*)::int`,
				users: sql<number>`count(distinct ${pageViewTable.userId})::int`,
			})
			.from(pageViewTable)
			.where(buildPageViewFilter(start, end, userId))
			.groupBy(day)
			.orderBy(day);
	},
);

export const getActionSeries = cache(
	async (start: Date, end: Date, userId?: string | null): Promise<ActionSeriesPoint[]> => {
		const day = sql`date_trunc('day', ${actionLogsTable.timestamp})`;
		return db
			.select({
				date: day.mapWith(toUtcDate),
				success: sql<number>`count(*) filter (where ${actionLogsTable.action} = 'success')::int`,
				failed: sql<number>`count(*) filter (where ${actionLogsTable.action} = 'failed')::int`,
				total: sql<number>`count(*)::int`,
			})
			.from(actionLogsTable)
			.where(buildActionFilter(start, end, userId))
			.groupBy(day)
			.orderBy(day);
	},
);

export const getTopPageViews = cache(
	async (start: Date, end: Date, limit = 8, userId?: string | null): Promise<TopPageView[]> => {
		return db
			.select({
				path: pageViewTable.path,
				total: sql<number>`count(*)::int`,
				uniqueUsers: sql<number>`count(distinct ${pageViewTable.userId})::int`,
			})
			.from(pageViewTable)
			.where(buildPageViewFilter(start, end, userId))
			.groupBy(pageViewTable.path)
			.orderBy(desc(sql`count(*)`))
			.limit(limit);
	},
);

export const getTopActionTypes = cache(
	async (start: Date, end: Date, limit = 8, userId?: string | null): Promise<TopActionType[]> => {
		return db
			.select({
				action: actionLogsTable.function,
				total: sql<number>`count(*)::int`,
				success: sql<number>`count(*) filter (where ${actionLogsTable.action} = 'success')::int`,
				failed: sql<number>`count(*) filter (where ${actionLogsTable.action} = 'failed')::int`,
				uniqueUsers: sql<number>`count(distinct ${actionUserId})::int`,
			})
			.from(actionLogsTable)
			.where(buildActionFilter(start, end, userId))
			.groupBy(actionLogsTable.function)
			.orderBy(desc(sql`count(*)`))
			.limit(limit);
	},
);

export const getPageViewExport = cache(async (start: Date, end: Date): Promise<PageViewExportRow[]> => {
	return db
		.select({
			timestamp: pageViewTable.timestamp,
			path: pageViewTable.path,
			searchParams: pageViewTable.searchParams,
			params: pageViewTable.params,
			userAgent: pageViewTable.userAgent,
			userId: pageViewTable.userId,
			sessionId: pageViewTable.session_id,
		})
		.from(pageViewTable)
		.where(buildPageViewFilter(start, end))
		.orderBy(pageViewTable.timestamp);
});

export const getActionExport = cache(async (start: Date, end: Date): Promise<ActionExportRow[]> => {
	return db
		.select({
			timestamp: actionLogsTable.timestamp,
			action: actionLogsTable.function,
			result: actionLogsTable.action,
			details: actionLogsTable.details,
			userId: actionUserId,
		})
		.from(actionLogsTable)
		.where(buildActionFilter(start, end))
		.orderBy(actionLogsTable.timestamp);
});
