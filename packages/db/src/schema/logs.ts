import {int, mysqlEnum, mysqlTable, timestamp, varchar} from "drizzle-orm/mysql-core";
import {sql} from "drizzle-orm";

export const logs = mysqlTable("logs", {
    id: int("id").autoincrement().primaryKey().notNull(),
    logType: mysqlEnum("log_type", ["web", "admin", "undefined"]).default("undefined"),
    created: timestamp("created").default(sql`CURRENT_TIMESTAMP`),
    content: varchar("content", {length: 16000}).notNull(),
});