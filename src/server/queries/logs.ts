import "server-only";
import { env } from "@/env";
import { ErrorTypes } from "@/lib/log-types";
import { db } from "../db";
import { actionLogsTable, errorLogsTable, systemLogsTable } from "../db/tables/logs";

interface IActionLog {
	fn: string;
	result: "failed" | "success";
	details: {
		user: string | null;
		session?: string | null;
		reason: ErrorTypes | null;
		[key: string]: unknown;
	};
}

export async function logAction(props: IActionLog) {
	if (env.DISABLE_LOGS) {
		return Promise.resolve();
	}

	if (props.details.user === "demo") {
		return Promise.resolve();
	}
	return db.insert(actionLogsTable).values({
		function: props.fn,
		action: props.result,
		details: {
			...props.details,
			success: props.result === "success",
		},
	});
}

interface IErrorLog {
	fn: string;
	error: Error;
	details: {
		user: string | null;
		session: string | null;
		[key: string]: unknown;
	};
}

export async function logError(props: IErrorLog) {
	if (env.DISABLE_LOGS) {
		return Promise.resolve();
	}

	if (props.details.user === "demo") {
		return Promise.resolve();
	}
	return db.insert(errorLogsTable).values({
		function: props.fn,
		details: {
			...props.details,
			error: props.error,
		},
	});
}

interface ISystemLog {
	fn: string;
	details: {
		sensor: string | null;
		user: string | null;
		reason: ErrorTypes;
		[key: string]: unknown;
	};
}

export async function logSystem(props: ISystemLog) {
	if (env.DISABLE_LOGS) {
		return Promise.resolve();
	}

	if (props.details.user === "demo") {
		return Promise.resolve();
	}

	return db.insert(systemLogsTable).values({
		title: props.fn,
		details: {
			...props.details,
		},
	});
}
