import { sql } from "drizzle-orm";
import {
    boolean,
    index,
    int,
    mysqlEnum,
    mysqlTable,
    primaryKey,
    text,
    timestamp,
    unique,
    uniqueIndex,
    varchar,
} from "drizzle-orm/mysql-core";
import { nanoid } from "nanoid";
import { decimalType } from "../types/dbTypes";
import { SensorType } from "../types/types";

const sensorTypes = [SensorType.Electricity, SensorType.Gas] as const;

export const sensor = mysqlTable(
    "sensor",
    {
        id: varchar("sensor_id", { length: 30 }).notNull().unique(),
        clientId: varchar("client_id", { length: 255 }).primaryKey().notNull(),
        version: int("version").default(1).notNull(),
        sensorType: mysqlEnum("sensor_type", sensorTypes).notNull(),
        userId: varchar("user_id", { length: 30 }),
        needsScript: boolean("needs_script").default(false).notNull(),
        script: text("script"),
    },
    (table) => {
        return {
            unq: unique().on(table.sensorType, table.userId),
        };
    },
);

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

export const sensorToken = mysqlTable(
    "sensor_token",
    {
        code: varchar("code", { length: 30 })
            .notNull()
            .primaryKey()
            .$defaultFn(() => nanoid(30)),
        sensorId: varchar("sensor_id", { length: 30 }).notNull(),
        timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`),
    },
    (table) => {
        return {
            sensorIdIdx: index("sensor_id_idx_sensor_token").on(table.sensorId),
        };
    },
);

export const sensorData = mysqlTable(
    "sensor_data",
    {
        id: varchar("id", { length: 35 })
            .primaryKey()
            .notNull()
            .$defaultFn(() => nanoid(35)),
        sensorId: varchar("sensor_id", { length: 30 }).notNull(),
        value: decimalType("value").notNull(),
        valueOut: decimalType("value_out"),
        valueCurrent: decimalType("value_current"),
        timestamp: timestamp("timestamp").notNull().default(sql`CURRENT_TIMESTAMP`),
    },
    (table) => {
        return {
            uniqueIdx: uniqueIndex("sensor_data_sensor_id_timestamp").on(table.sensorId, table.timestamp),
        };
    },
);

const sequenceTypes = ["peak", "anomaly"] as const;

export const sensorDataSequence = mysqlTable(
    "sensor_data_sequence",
    {
        id: varchar("id", { length: 30 })
            .primaryKey()
            .notNull()
            .$defaultFn(() => nanoid(30)),
        sensorId: varchar("sensor_id", { length: 30 }).notNull(),
        start: timestamp("start").notNull(),
        end: timestamp("end").notNull(),
        type: mysqlEnum("type", sequenceTypes).notNull(),
        averagePeakPower: decimalType("average_peak_power").notNull(),
    },
    (table) => {
        return {
            uniqueIdxStart: uniqueIndex("senor_data_sequence_sensor_id_start").on(table.sensorId, table.start),
            uniqueIdxEnd: uniqueIndex("senor_data_sequence_sensor_id_end").on(table.sensorId, table.end),
            index: index("senor_data_sequence_sensor_id").on(table.sensorId, table.start, table.end),
        };
    },
);

export const sensorSequenceMarkingLog = mysqlTable(
    "sensor_sequence_marking_log",
    {
        sensorId: varchar("sensor_id", { length: 30 }).notNull(),
        sequenceType: mysqlEnum("sequence_type", sequenceTypes).notNull(),
        lastMarked: timestamp("last_marked").notNull().default(sql`CURRENT_TIMESTAMP`),
    },
    (table) => {
        return {
            pk: primaryKey({ columns: [table.sensorId, table.sequenceType] }),
        };
    },
);
