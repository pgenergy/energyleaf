import { genID } from "@/lib/utils";
import { sql } from "drizzle-orm";
import { json, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const logsTable = pgTable("legacy_logs", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => genID(30)),
	timestamp: timestamp("timestamp", { mode: "date", withTimezone: true }).default(sql`now()`),
	title: text("title").notNull(),
	logType: text("log_type", { enum: ["action", "error", "info", "undefined"] }).default("undefined"),
	appFunction: text("app_function").notNull(),
	appComponent: text("app_component", { enum: ["web", "admin", "api", "undefined"] }).default("undefined"),
	details: json("details").$type<unknown>(),
});

export const systemLogsTable = pgTable("system_logs", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => genID(30)),
	timestamp: timestamp("timestamp", { mode: "date", withTimezone: true }).default(sql`now()`),
	title: text("title").notNull(),
	details: json("details").$type<unknown>(),
});

export const errorLogsTable = pgTable("error_logs", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => genID(30)),
	timestamp: timestamp("timestamp", { mode: "date", withTimezone: true }).default(sql`now()`),
	function: text("app_function").notNull(),
	details: json("details").$type<unknown>(),
});

export const actionLogsTable = pgTable("action_logs", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => genID(30)),
	timestamp: timestamp("timestamp", { mode: "date", withTimezone: true }).default(sql`now()`),
	function: text("app_function").notNull(),
	action: text("action").notNull(),
	details: json("details").$type<unknown>(),
});

export const pageViewTable = pgTable("page_views", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => genID(30)),
	timestamp: timestamp("timestamp", { mode: "date", withTimezone: true }).default(sql`now()`),
	path: text("path").notNull(),
	searchParams: json("search_params").$type<unknown>(),
	userAgent: text("user_agent"),
	userId: text("user_id"),
	session_id: text("session_id").notNull(),
	params: json("params").$type<unknown>(),
});
