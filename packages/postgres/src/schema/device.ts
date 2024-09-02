import { sql } from "drizzle-orm";
import { integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { numericType } from "../types/dbTypes";
import { DeviceCategory } from "../types/types";

const deviceFields = {
    id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity({
        startWith: 48,
    }),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    category: text("category", { enum: Object.values(DeviceCategory) as [string, ...string[]] }).notNull(),
    created: timestamp("created", { mode: "date", withTimezone: true }).default(sql`now()`),
    timestamp: timestamp("timestamp", { mode: "date", withTimezone: true })
        .default(sql`now()`)
        .$onUpdateFn(() => sql`now()`)
        .notNull(),
    powerEstimation: numericType("power_estimation"),
    weeklyUsageEstimation: numericType("weekly_usage_estimation"),
};

export const deviceTable = pgTable("device", {
    ...deviceFields,
});

export const deviceHistoryTable = pgTable("history_device", {
    ...deviceFields,
    deviceId: integer("device_id").notNull(),
});

/**
 * A table to handle the n:m relationship between devices and peaks. A peak is an entry in the sensor_data_sequence table.
 */
export const deviceToPeakTable = pgTable(
    "device_to_peak",
    {
        deviceId: integer("device_id").notNull(),
        sensorDataSequenceId: text("sensor_data_sequence_id").notNull(),
    },
    (table) => {
        return {
            pk: primaryKey({ columns: [table.deviceId, table.sensorDataSequenceId] }),
        };
    },
);

/**
 * Stores suggestions for device categories per peak provided by a ML model.
 */
export const deviceSuggestionsPeakTable = pgTable("device_suggestions_peak", {
    id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity(),
    sensorDataSequenceId: text("sensor_data_sequence_id").notNull(),
    deviceCategory: text("device_category", { enum: Object.values(DeviceCategory) as [string, ...string[]] }).notNull(),
});
