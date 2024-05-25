import { sql } from "drizzle-orm";
import { index, int, mysqlTable, primaryKey, timestamp, unique, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const device = mysqlTable("device", {
    id: int("id").autoincrement().primaryKey().notNull(),
    userId: varchar("user_id", { length: 30 }).notNull(),
    name: varchar("name", { length: 30 }).notNull(),
    category: varchar("category", { length: 50 }).notNull(),
    created: timestamp("created").default(sql`CURRENT_TIMESTAMP`),
    timestamp: timestamp("timestamp").defaultNow().onUpdateNow().notNull(),
});

export const deviceHistory = mysqlTable("history_device", {
    id: int("id").autoincrement().primaryKey().notNull(),
    deviceId: int("device_id").notNull(),
    userId: varchar("user_id", { length: 30 }).notNull(),
    name: varchar("name", { length: 30 }).notNull(),
    category: varchar("category", { length: 50 }),
    created: timestamp("created").default(sql`CURRENT_TIMESTAMP`),
    timestamp: timestamp("timestamp"),
});

/**
 * A table to handle the n:m relationship between devices and peaks. A peak is an entry in the sensor_data table.
 */
export const deviceToPeak = mysqlTable(
    "device_to_peak",
    {
        deviceId: int("device_id").notNull(),
        sensorDataId: varchar("id", { length: 35 }).notNull(),
    },
    (table) => {
        return {
            pk: primaryKey({ columns: [table.deviceId, table.sensorDataId] }),
        };
    },
);
