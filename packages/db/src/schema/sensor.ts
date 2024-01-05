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

export const peaks = mysqlTable("peaks", {
    id: int("id").autoincrement().primaryKey().notNull(),
    sensorDataId: int("sensor_data_id").notNull().unique(),
    deviceId: int("device_id").notNull(),
});
