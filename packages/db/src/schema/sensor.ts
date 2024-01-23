import { sql } from "drizzle-orm";
import { int, mysqlEnum, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export enum SensorType {
    Electricity = "electricity",
    Gas = "gas"
}
const sensorTypes = [SensorType.Electricity, SensorType.Gas] as const

export const sensor = mysqlTable("sensor", {
    id: varchar("sensor_id", { length: 30 }).primaryKey().notNull(),
    key: varchar("key", { length: 40 }),
    macAddress: varchar("mac_address", { length: 17 }).notNull().unique(),
    code: varchar("code", { length: 30 }).notNull(), // TODO: Can we remove this?
    version: int("version").default(1).notNull(),
    sensor_type: mysqlEnum("sensor_type", sensorTypes).notNull(),
    user_id: int("user_id").notNull(),
});

export const sensorData = mysqlTable("sensor_data", {
    id: int("id").autoincrement().primaryKey().notNull(),
    sensorId: varchar("sensor_id", { length: 30 }),
    value: int("value").notNull(),
    timestamp: timestamp("timestamp")
        .default(sql`CURRENT_TIMESTAMP`)
});

export const peaks = mysqlTable("peaks", {
    id: int("id").autoincrement().primaryKey().notNull(),
    sensorId: varchar("sensor_id", { length: 30 }).notNull(),
    deviceId: int("device_id").notNull(),
    timestamp: timestamp("timestamp")
});
