import { sql } from "drizzle-orm";
import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const buttonTracking = mysqlTable("button_tracking", {
    id: int("id").autoincrement().primaryKey().notNull(),
    buttonName: varchar("button_name", { length: 255 }).notNull(),
    timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`),
    userId: int("user_id").notNull(),
});

export const feedback = mysqlTable("feedback", {
    id: int("id").autoincrement().primaryKey().notNull(),
    userId: int("user_id").notNull(),
    recommendation: varchar("recommendation", { length: 255 }),
    value: varchar("value", { length: 255 }),
    feedback: varchar("feedback", { length: 255 }),
});
