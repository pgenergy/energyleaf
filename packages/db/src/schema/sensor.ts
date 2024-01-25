import { sql } from "drizzle-orm";
import { int, mysqlEnum, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export enum SensorType {
    Electricity = "electricity",
    Gas = "gas"
}
const sensorTypes = [SensorType.Electricity, SensorType.Gas] as const

export const sensor = mysqlTable("sensor", {
    id: int("sensor_id").autoincrement().primaryKey(),
    key: varchar("key", { length: 40 }),
    macAddress: varchar("mac_address", { length: 17 }).notNull().unique(),
    sensor_type: mysqlEnum("sensor_type", sensorTypes).notNull(),
    user_id: int("user_id").notNull(),
});

export const sensorData = mysqlTable("sensor_data", {
    id: int("id").autoincrement().primaryKey().notNull(),
    sensorId: int("sensor_id"),
    value: int("value").notNull(),
    timestamp: timestamp("timestamp")
        .default(sql`CURRENT_TIMESTAMP`)
});

export const peaks = mysqlTable("peaks", {
    id: int("id").autoincrement().primaryKey().notNull(),
    sensorId: int("sensor_id"),
    deviceId: int("device_id").notNull(),
    timestamp: timestamp("timestamp")
});
