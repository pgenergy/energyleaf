import { sql } from "drizzle-orm";
import { integer, json, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const logs = pgTable("logs", {
    id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity(),
    timestamp: timestamp("timestamp", { mode: "date", withTimezone: true }).default(sql`now()`),
    title: varchar("title", { length: 128 }).notNull(),
    logType: text("log_type", { enum: ["action", "error", "info", "undefined"] }).default("undefined"),
    appFunction: varchar("app_function", { length: 128 }).notNull(),
    appComponent: text("app_component", { enum: ["web", "admin", "api", "undefined"] }).default("undefined"),
    details: json("details").$type<unknown>(),
});
