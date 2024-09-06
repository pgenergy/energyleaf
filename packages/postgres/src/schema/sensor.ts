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
    sensorId: sensorDataTable.sensorId,
    maxValue: sql<number>`MAX(${sensorDataTable.value})`.as("max_value"),
    minValue: sql<number>`MIN(${sensorDataTable.value})`.as("min_value"),
    maxValueOut: sql<number>`MAX(${sensorDataTable.valueOut})`.as("max_value_out"),
    minValueOut: sql<number>`MIN(${sensorDataTable.valueOut})`.as("min_value_out"),
    avgValueCurrent: sql<number>`AVG(${sensorDataTable.valueCurrent})`.as("avg_value_current"),
    maxValueCurrent: sql<number>`MAX(${sensorDataTable.valueCurrent})`.as("max_value_current"),
    minValueCurrent: sql<number>`MIN(${sensorDataTable.valueCurrent})`.as("min_value_current"),
    avgConsumption: sql<number>`AVG(${sensorDataTable.consumption})`.as("avg_consumption"),
    sumConsumption: sql<number>`SUM(${sensorDataTable.consumption})`.as("sum_consumption"),
    avgInserted: sql<number>`AVG(${sensorDataTable.inserted})`.as("avg_inserted"),
    sumInserted: sql<number>`SUM(${sensorDataTable.inserted})`.as("sum_inserted"),
    minTimestamp: sql<Date>`MIN(${sensorDataTable.timestamp})`.as("min_timestamp"),
    maxTimestamp: sql<Date>`MAX(${sensorDataTable.timestamp})`.as("max_timestamp"),
};

export const sensorDataHourTable = pgMaterializedView("sensor_data_hour")
    .with({
        "timescaledb.continuous": true,
    })
    .withNoData()
    .as((qb) => {
        return qb
            .select({
                bucket: sql`time_bucket('1 hour', ${sensorDataTable.timestamp}, 'Europe/Berlin')`
                    .mapWith((value) => new Date(`${value}+0000`))
                    .as("bucket"),
                ...sensorDataAggFields,
            })
            .from(sensorDataTable)
            .groupBy(sensorDataTable.sensorId, sql`bucket`);
    });

export const sensorDataDayTable = pgMaterializedView("sensor_data_day")
    .with({
        "timescaledb.continuous": true,
    })
    .withNoData()
    .as((qb) => {
        return qb
            .select({
                bucket: sql`time_bucket('1 day', ${sensorDataTable.timestamp}, 'Europe/Berlin')`
                    .mapWith((value) => new Date(`${value}+0000`))
                    .as("bucket"),
                ...sensorDataAggFields,
            })
            .from(sensorDataTable)
            .groupBy(sensorDataTable.sensorId, sql`bucket`);
    });

export const sensorDataWeekTable = pgMaterializedView("sensor_data_week")
    .with({
        "timescaledb.continuous": true,
    })
    .withNoData()
    .as((qb) => {
        return qb
            .select({
                bucket: sql`time_bucket('1 week', ${sensorDataTable.timestamp}, 'Europe/Berlin')`
                    .mapWith((value) => new Date(`${value}+0000`))
                    .as("bucket"),
                ...sensorDataAggFields,
            })
            .from(sensorDataTable)
            .groupBy(sensorDataTable.sensorId, sql`bucket`);
    });

export const sensorDataMonthTable = pgMaterializedView("sensor_data_month")
    .with({
        "timescaledb.continuous": true,
    })
    .withNoData()
    .as((qb) => {
        return qb
            .select({
                bucket: sql`time_bucket('1 month', ${sensorDataTable.timestamp}, 'Europe/Berlin')`
                    .mapWith((value) => new Date(`${value}+0000`))
                    .as("bucket"),
                ...sensorDataAggFields,
            })
            .from(sensorDataTable)
            .groupBy(sensorDataTable.sensorId, sql`bucket`);
    });

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

export const sensorSequenceMarkingLogTable = pgTable(
    "sensor_sequence_marking_log",
    {
        sensorId: text("sensor_id").notNull(),
        sequenceType: text("sequence_type", { enum: sequenceTypes }).notNull(),
        lastMarked: timestamp("last_marked", { mode: "date", withTimezone: true }).notNull().default(sql`now()`),
    },
    (table) => {
        return {
            pk: primaryKey({ columns: [table.sensorId, table.sequenceType] }),
        };
    },
);
