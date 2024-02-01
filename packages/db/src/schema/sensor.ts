import { sql } from "drizzle-orm";
import { int, mysqlEnum, mysqlTable, primaryKey, timestamp, varchar } from "drizzle-orm/mysql-core";
import { nanoid } from "nanoid";

export const sensor = mysqlTable("sensor", {
    id: varchar("sensor_id", { length: 30 }).notNull(),
    clientId: varchar("client_id", { length: 255 }).primaryKey().notNull(),
    version: int("version").default(1).notNull(),
    sensor_type: mysqlEnum("sensor_type", ["electricity", "gas"]).notNull(),
    userId: int("user_id").notNull(),
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
        sensorId: varchar("sensor_id", { length: 30 }),
        value: int("value").notNull(),
        timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`),
    },
    (table) => {
        return {
            pk: primaryKey({ columns: [table.sensorId, table.timestamp] }),
        };
    },
);

export const peaks = mysqlTable("peaks", {
    id: int("id").autoincrement().primaryKey().notNull(),
    sensorId: varchar("sensor_id", { length: 30 }).notNull(),
    deviceId: int("device_id").notNull(),
    timestamp: timestamp("timestamp"),
});
