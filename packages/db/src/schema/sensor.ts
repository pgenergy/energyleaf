import { sql } from "drizzle-orm";
import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const sensor = mysqlTable("sensor", {
    id: int("id").autoincrement().primaryKey().notNull(),
    key: varchar("key", { length: 40 }),
    macAddress: varchar("mac_address", { length: 17 }).notNull().unique(),
    code: varchar("code", { length: 30 }).notNull(), // TODO: Can we remove this?
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
