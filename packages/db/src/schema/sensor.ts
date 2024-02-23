import { sql } from "drizzle-orm";
import { boolean, int, mysqlEnum, mysqlTable, timestamp, uniqueIndex, varchar, float } from "drizzle-orm/mysql-core";
import { nanoid } from "nanoid";

export const sensor = mysqlTable("sensor", {
    id: varchar("sensor_id", { length: 30 }).notNull().unique(),
    clientId: varchar("client_id", { length: 255 }).primaryKey().notNull(),
    version: int("version").default(1).notNull(),
    sensor_type: mysqlEnum("sensor_type", ["electricity", "gas"]).notNull(),
    userId: int("user_id").notNull(),
    needsScript: boolean("needs_script").default(true).notNull(),
    script: varchar("script", { length: 255 }),
});

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
        id: int("id").autoincrement().primaryKey().notNull(),
        sensorId: varchar("sensor_id", { length: 30 }).notNull(),
        value: float("value").notNull(),
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
