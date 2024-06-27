import { sql } from "drizzle-orm";
import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const device = mysqlTable("device", {
    id: int("id").autoincrement().primaryKey().notNull(),
    userId: varchar("user_id", { length: 30 }).notNull(),
    name: varchar("name", { length: 30 }).notNull(),
    category: varchar("category", { length: 50 }).notNull(),
    created: timestamp("created").default(sql`CURRENT_TIMESTAMP`),
    timestamp: timestamp("timestamp").defaultNow().onUpdateNow().notNull(),
});

export const deviceHistory = mysqlTable("history_device", {
    id: int("id").autoincrement().primaryKey().notNull(),
    deviceId: int("device_id").notNull(),
    userId: varchar("user_id", { length: 30 }).notNull(),
    name: varchar("name", { length: 30 }).notNull(),
    category: varchar("category", { length: 50 }),
    created: timestamp("created").default(sql`CURRENT_TIMESTAMP`),
    timestamp: timestamp("timestamp"),
});
