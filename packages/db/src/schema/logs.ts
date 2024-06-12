import { sql } from "drizzle-orm";
import {int, json, mysqlEnum, mysqlTable, timestamp, varchar} from "drizzle-orm/mysql-core";

export const logs = mysqlTable("logs", {
    id: int("id").autoincrement().primaryKey().notNull(),
    timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`),
    title: varchar("title", {length: 128}).notNull(),
    logType: mysqlEnum("log_type", ["action", "error", "info", "undefined"]).default("undefined"),
    appFunction: varchar("app_function", {length: 128}).notNull(),
    appComponent: mysqlEnum("app_component", ["web", "admin", "api", "undefined"]).default("undefined"),
    details: json("details").$type<unknown>(),
});
