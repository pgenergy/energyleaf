import { sql } from "drizzle-orm";
import {
    boolean,
    int,
    mysqlEnum,
    mysqlTable,
    primaryKey,
    real,
    text,
    timestamp,
    uniqueIndex,
    varchar,
} from "drizzle-orm/mysql-core";
import { nanoid } from "nanoid";
import { SensorType } from "../types/types";

const sensorTypes = [SensorType.Electricity, SensorType.Gas] as const;

export const sensor = mysqlTable("sensor", {
    id: varchar("sensor_id", { length: 30 }).notNull().unique(),
    clientId: varchar("client_id", { length: 255 }).primaryKey().notNull(),
    version: int("version").default(1).notNull(),
    sensorType: mysqlEnum("sensor_type", sensorTypes).notNull(),
    userId: varchar("user_id", { length: 30 }),
    needsScript: boolean("needs_script").default(false).notNull(),
    script: text("script"),
});

export const sensorHistory = mysqlTable(
    "sensor_history",
    {
        sensorId: varchar("sensor_id", { length: 30 }).notNull(),
        userId: varchar("user_id", { length: 30 }).notNull(),
        sensorType: mysqlEnum("sensor_type", sensorTypes).notNull(),
        clientId: varchar("client_id", { length: 255 }).notNull(),
    },
    (table) => {
        return {
            pk: primaryKey({ columns: [table.clientId, table.userId] }),
        };
    },
);

export const sensorToken = mysqlTable("sensor_token", {
    code: varchar("code", { length: 30 })
        .notNull()
        .primaryKey()
        .$defaultFn(() => nanoid(30)),
    sensorId: varchar("sensor_id", { length: 30 }).notNull(),
    timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`),
});

export const sensorData = mysqlTable(
    "sensor_data",
    {
        id: varchar("id", { length: 35 })
            .primaryKey()
            .notNull()
            .$defaultFn(() => nanoid(35)),
        sensorId: varchar("sensor_id", { length: 30 }).notNull(),
        value: real("value", { precision: 12, scale: 4 }).notNull(),
        timestamp: timestamp("timestamp")
            .notNull()
            .default(sql`CURRENT_TIMESTAMP`),
    },
    (table) => {
        return {
            uniqueIdx: uniqueIndex("sensor_data_sensor_id_timestamp").on(table.sensorId, table.timestamp),
        };
    },
);

export const peaks = mysqlTable("peaks", {
    id: int("id").autoincrement().primaryKey().notNull(),
    sensorId: varchar("sensor_id", { length: 30 }).notNull(),
    deviceId: int("device_id").notNull(),
    timestamp: timestamp("timestamp"),
});
