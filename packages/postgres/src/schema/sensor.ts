import { sql } from "drizzle-orm";
import {
    boolean,
    index,
    integer,
    pgMaterializedView,
    pgTable,
    primaryKey,
    text,
    timestamp,
    unique,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { numericType } from "../types/dbTypes";
import { SensorType } from "../types/types";

const sensorTypes = [SensorType.Electricity, SensorType.Gas] as const;

export const sensorTable = pgTable(
    "sensor",
    {
        id: text("sensor_id").notNull().unique(),
        clientId: text("client_id").primaryKey().notNull(),
        version: integer("version").default(1).notNull(),
        sensorType: text("sensor_type", { enum: sensorTypes }).notNull(),
        userId: text("user_id"),
        needsScript: boolean("needs_script").default(false).notNull(),
        script: text("script"),
    },
    (table) => {
        return {
            unq: unique().on(table.sensorType, table.userId),
        };
    },
);

export const sensorHistoryTable = pgTable(
    "sensor_history",
    {
        sensorId: text("sensor_id").notNull(),
        userId: text("user_id").notNull(),
        sensorType: text("sensor_type", { enum: sensorTypes }).notNull(),
        clientId: text("client_id").notNull(),
    },
    (table) => {
        return {
            pk: primaryKey({ columns: [table.clientId, table.userId] }),
        };
    },
);

export const sensorTokenTable = pgTable(
    "sensor_token",
    {
        code: text("code")
            .notNull()
            .primaryKey()
            .$defaultFn(() => nanoid(30)),
        sensorId: text("sensor_id").notNull(),
        timestamp: timestamp("timestamp").default(sql`now()`),
    },
    (table) => {
        return {
            sensorIdIdx: index("sensor_id_idx_sensor_token").on(table.sensorId),
        };
    },
);

export const sensorDataTable = pgTable(
    "sensor_data",
    {
        id: text("id")
            .notNull()
            .$defaultFn(() => nanoid(35)),
        sensorId: text("sensor_id").notNull(),
        value: numericType("value").notNull(),
        consumption: numericType("consumption").notNull(),
        valueOut: numericType("value_out"),
        inserted: numericType("inserted"),
        valueCurrent: numericType("value_current"),
        timestamp: timestamp("timestamp", { mode: "date", withTimezone: true }).notNull().default(sql`now()`),
    },
    (table) => {
        return {
            pk: primaryKey({ columns: [table.sensorId, table.timestamp] }),
        };
    },
);

const sensorDataAggFields = {
    bucket: timestamp("bucket", { mode: "date", withTimezone: true }),
    sensorId: text("sensor_id").notNull(),
    maxValue: numericType("max_value"),
    minValue: numericType("min_value"),
    maxValueOut: numericType("max_value_out"),
    minValueOut: numericType("min_value_out"),
    avgValueCurrent: numericType("avg_value_current"),
    maxValueCurrent: numericType("max_value_current"),
    minValueCurrent: numericType("min_value_current"),
    avgConsumption: numericType("avg_consumption"),
    sumConsumption: numericType("sum_consumption"),
    avgInserted: numericType("avg_inserted"),
    sumInserted: numericType("sum_inserted"),
    minTimestamp: timestamp("min_timestamp", { mode: "date", withTimezone: true }),
    maxTimestamp: timestamp("max_timestamp", { mode: "date", withTimezone: true }),
};

export const sensorDataHourTable = pgMaterializedView("sensor_data_hour", {
    ...sensorDataAggFields,
}).existing();

export const sensorDataDayTable = pgMaterializedView("sensor_data_day", {
    ...sensorDataAggFields,
}).existing();

export const sensorDataWeekTable = pgMaterializedView("sensor_data_week", {
    ...sensorDataAggFields,
}).existing();

export const sensorDataMonthTable = pgMaterializedView("sensor_data_month", {
    ...sensorDataAggFields,
}).existing();

const sequenceTypes = ["peak", "anomaly"] as const;

export const sensorDataSequenceTable = pgTable(
    "sensor_data_sequence",
    {
        id: text("id")
            .primaryKey()
            .notNull()
            .$defaultFn(() => nanoid(25)),
        sensorId: text("sensor_id").notNull(),
        start: timestamp("start", { mode: "date", withTimezone: true }).notNull(),
        end: timestamp("end", { mode: "date", withTimezone: true }).notNull(),
        type: text("type", { enum: sequenceTypes }).notNull(),
        averagePeakPower: numericType("average_peak_power").notNull(),
    },
    (table) => {
        return {
            uniqueIdxStart: uniqueIndex("senor_data_sequence_sensor_id_start").on(table.sensorId, table.start),
            uniqueIdxEnd: uniqueIndex("senor_data_sequence_sensor_id_end").on(table.sensorId, table.end),
            index: index("senor_data_sequence_sensor_id").on(table.sensorId, table.start, table.end),
        };
    },
);
