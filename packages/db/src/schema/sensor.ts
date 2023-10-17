import { sql } from "drizzle-orm";
import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const sensor = mysqlTable("sensor", {
    id: varchar("sensor_id", { length: 30 }).primaryKey().notNull(),
    code: varchar("code", { length: 30 }).notNull(),
    version: int("version").default(1).notNull(),
});

export const sensorData = mysqlTable("sensor_data", {
    id: int("id").autoincrement().primaryKey().notNull(),
    userId: int("user_id").notNull(),
    value: int("value").notNull(),
    timestamp: timestamp("timestamp")
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});

export const reason = mysqlTable("reason", {
    id: int("id").autoincrement().primaryKey().notNull(),
    userId: int("user_id").notNull(),
    reason: varchar("reason", { length: 255 }),
    timestamp: timestamp("timestamp")
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    value: int("value").notNull(),
});
