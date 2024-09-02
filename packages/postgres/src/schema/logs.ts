import { sql } from "drizzle-orm";
import { integer, json, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const logsTable = pgTable("logs", {
    id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity({
        startWith: 81597,
    }),
    timestamp: timestamp("timestamp", { mode: "date", withTimezone: true }).default(sql`now()`),
    title: text("title").notNull(),
    logType: text("log_type", { enum: ["action", "error", "info", "undefined"] }).default("undefined"),
    appFunction: text("app_function").notNull(),
    appComponent: text("app_component", { enum: ["web", "admin", "api", "undefined"] }).default("undefined"),
    details: json("details").$type<unknown>(),
});
