import {int, mysqlEnum, mysqlTable, timestamp, varchar} from "drizzle-orm/mysql-core";
import {sql} from "drizzle-orm";

export const logs = mysqlTable("logs", {
    id: int("id").autoincrement().primaryKey().notNull(),
    timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`),
    title: varchar("title", {length: 1024}).notNull(),
    logType: mysqlEnum("log_type", ["info", "error", "undefined"]).default("undefined"),
    appComponent: mysqlEnum("app_component", ["web", "admin", "api", "undefined"]).default("undefined"),
    details: varchar("content", {length: 12000}),
});