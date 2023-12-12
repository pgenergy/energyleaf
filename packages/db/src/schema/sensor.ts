import { sql } from "drizzle-orm";
import { int, mysqlEnum, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const sensor = mysqlTable("sensor", {
    id: varchar("sensor_id", { length: 30 }).primaryKey().notNull(),
    code: varchar("code", { length: 30 }).notNull(),
    version: int("version").default(1).notNull(),
    sensor_type: mysqlEnum("sensor_type", ["electricity", "gas"]).notNull(),
    user_id: int("user_id").notNull(),
});

export const sensorData = mysqlTable("sensor_data", {
    sensorId: varchar("sensor_id", { length: 30 }).primaryKey().notNull(),
    value: int("value").notNull(),
    timestamp: timestamp("timestamp")
        .default(sql`CURRENT_TIMESTAMP`)
        .primaryKey().notNull(),
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
