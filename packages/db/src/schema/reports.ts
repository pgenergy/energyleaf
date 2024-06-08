import { sql } from "drizzle-orm";
import { boolean, date, float, int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { nanoid } from "nanoid";

export const reportConfig = mysqlTable("report_config", {
    id: int("id").autoincrement().primaryKey().notNull(),
    userId: varchar("user_id", { length: 30 }).notNull(),
    receiveMails: boolean("receive_mails").default(true).notNull(),
    interval: int("interval").default(3).notNull(),
    time: int("time").default(6).notNull(),
    timestampLast: timestamp("timestamp_last").default(sql`'2020-01-01 00:00:00'`).notNull(),
    createdTimestamp: timestamp("created_timestamp").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const historyReportConfig = mysqlTable("history_report_config", {
    id: int("id").autoincrement().primaryKey().notNull(),
    userId: varchar("user_id", { length: 30 }).notNull(),
    receiveMails: boolean("receive_mails").default(true).notNull(),
    interval: int("interval").default(3).notNull(),
    time: int("time").default(6).notNull(),
    timestampLast: timestamp("timestamp_last").default(sql`'2020-01-01 00:00:00'`).notNull(),
    createdTimestamp: timestamp("created_timestamp").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const reports = mysqlTable("reports", {
    id: varchar("id", { length: 35 })
        .primaryKey()
        .notNull()
        .$defaultFn(() => nanoid(35)),
    timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`).notNull(),
    userId: varchar("user_id", { length: 30 }).notNull(),
    dateFrom: timestamp("date_from").default(sql`CURRENT_TIMESTAMP`).notNull(),
    dateTo: timestamp("date_to").default(sql`CURRENT_TIMESTAMP`).notNull(),
    totalEnergyConsumption: float("total_energy_consumption").notNull(),
    avgEnergyConsumptionPerDay: float("avg_energy_consumption_per_day").notNull(),
    totalEnergyCost: float("total_energy_cost"),
    avgEnergyCost: float("avg_energy_cost"),
    worstDay: timestamp("worst_day").notNull(),
    worstDayConsumption: float("worst_day_consumption").notNull(),
    bestDay: timestamp("best_day").notNull(),
    bestDayConsumption: float("best_day_consumption").notNull(),
});

export const reportsDayStatistics = mysqlTable("reports_day_statistics", {
    id: varchar("id", { length: 35 })
        .primaryKey()
        .notNull()
        .$defaultFn(() => nanoid(35)),
    date: timestamp("date").notNull(),
    dailyConsumption: float("daily_consumption").notNull(),
    dailyGoal: float("daily_goal"),
    exceeded: boolean("exceeded"),
    progress: float("progress"),
    reportId: varchar("report_id", { length: 35 }).notNull(),
});