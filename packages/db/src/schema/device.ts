import { sql } from "drizzle-orm";
import { int, mysqlEnum, mysqlTable, primaryKey, timestamp, varchar } from "drizzle-orm/mysql-core";
import { decimalType } from "../types/dbTypes";
import { DeviceCategory } from "../types/types";

const deviceFields = {
    id: int("id").autoincrement().primaryKey().notNull(),
    userId: varchar("user_id", { length: 30 }).notNull(),
    name: varchar("name", { length: 30 }).notNull(),
    category: mysqlEnum("category", Object.values(DeviceCategory) as [string, ...string[]]).notNull(),
    created: timestamp("created").default(sql`CURRENT_TIMESTAMP`),
    timestamp: timestamp("timestamp").defaultNow().onUpdateNow().notNull(),
    powerEstimation: decimalType("power_estimation"),
};

export const device = mysqlTable("device", {
    ...deviceFields,
});

export const deviceHistory = mysqlTable("history_device", {
    ...deviceFields,
    deviceId: int("device_id").notNull(),
});

/**
 * A table to handle the n:m relationship between devices and peaks. A peak is an entry in the sensor_data_sequence table.
 */
export const deviceToPeak = mysqlTable(
    "device_to_peak",
    {
        deviceId: int("device_id").notNull(),
        sensorDataSequenceId: varchar("sensor_data_sequence_id", { length: 30 }).notNull(),
    },
    (table) => {
        return {
            pk: primaryKey({ columns: [table.deviceId, table.sensorDataSequenceId] }),
        };
    },
);
