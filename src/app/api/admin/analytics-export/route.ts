import { endOfMonth, startOfMonth } from "date-fns";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/server/lib/auth";
import { getActionExport, getPageViewExport } from "@/server/queries/analytics";

const csvHeaders = [
	"type",
	"timestamp",
	"user_id",
	"session_id",
	"path",
	"search_params",
	"params",
	"user_agent",
	"action_type",
	"action_result",
	"action_details",
];

function parseDate(value: string | null) {
	if (!value) {
		return null;
	}
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return null;
	}
	return parsed;
}

function serializeValue(value: unknown) {
	if (value === null || value === undefined) {
		return "";
	}
	if (typeof value === "string") {
		return value;
	}
	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}
	return JSON.stringify(value);
}

function escapeCsv(value: unknown) {
	const raw = serializeValue(value);
	if (raw === "") {
		return "";
	}
	if (/[",\n\r]/.test(raw)) {
		return `"${raw.replace(/"/g, '""')}"`;
	}
	return raw;
}

export async function GET(req: NextRequest) {
	const { user } = await getCurrentSession();
	if (!user || !user.isAdmin) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const { searchParams } = new URL(req.url);
	const startParam = parseDate(searchParams.get("start"));
	const endParam = parseDate(searchParams.get("end"));
	let start = startParam;
	let end = endParam;

	if (!start || !end) {
		const baseDate = startParam ?? endParam ?? new Date();
		start = startOfMonth(baseDate);
		end = endOfMonth(baseDate);
	}
	if (start && end && start.getTime() > end.getTime()) {
		[start, end] = [end, start];
	}

	const [pageViews, actions] = await Promise.all([getPageViewExport(start, end), getActionExport(start, end)]);
	const rows: unknown[][] = [csvHeaders];

	for (const view of pageViews) {
		rows.push([
			"page_view",
			view.timestamp?.toISOString() ?? "",
			view.userId ?? "",
			view.sessionId ?? "",
			view.path,
			view.searchParams,
			view.params,
			view.userAgent ?? "",
			"",
			"",
			"",
		]);
	}

	for (const action of actions) {
		rows.push([
			"action",
			action.timestamp?.toISOString() ?? "",
			action.userId ?? "",
			"",
			"",
			"",
			"",
			"",
			action.action,
			action.result,
			action.details,
		]);
	}

	const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
	const filename = `analytics-${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}.csv`;

	return new NextResponse(csv, {
		headers: {
			"Content-Type": "text/csv; charset=utf-8",
			"Content-Disposition": `attachment; filename="${filename}"`,
		},
	});
}
