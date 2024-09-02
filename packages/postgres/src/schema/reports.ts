import { sql } from "drizzle-orm";
import { boolean, doublePrecision, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

const reportConfigFields = {
    id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity({
        startWith: 106,
    }),
    userId: text("user_id").notNull(),
    receiveMails: boolean("receive_mails").default(true).notNull(),
    interval: integer("interval").default(3).notNull(),
    time: integer("time").default(6).notNull(),
    timestampLast: timestamp("timestamp_last", { mode: "date", withTimezone: true })
        .default(sql`'2020-01-01 00:00:00'`)
        .notNull(),
    createdTimestamp: timestamp("created_timestamp", { mode: "date", withTimezone: true })
        .default(sql`now()`)
        .notNull(),
};

export const reportConfigTable = pgTable("report_config", {
    ...reportConfigFields,
});

export const historyReportConfigTable = pgTable("history_report_config", {
    ...reportConfigFields,
});

export const reportsTable = pgTable("report_data", {
    id: text("id")
        .primaryKey()
        .notNull()
        .$defaultFn(() => nanoid(25)),
    timestamp: timestamp("timestamp", { mode: "date", withTimezone: true }).default(sql`now()`).notNull(),
    userId: text("user_id").notNull(),
    dateFrom: timestamp("date_from", { mode: "date", withTimezone: true }).default(sql`now()`).notNull(),
    dateTo: timestamp("date_to", { mode: "date", withTimezone: true }).default(sql`now()`).notNull(),
    totalEnergyConsumption: doublePrecision("total_energy_consumption").notNull(),
    avgEnergyConsumptionPerDay: doublePrecision("avg_energy_consumption_per_day").notNull(),
    totalEnergyCost: doublePrecision("total_energy_cost"),
    avgEnergyCost: doublePrecision("avg_energy_cost"),
    worstDay: timestamp("worst_day", { mode: "date", withTimezone: true }).notNull(),
    worstDayConsumption: doublePrecision("worst_day_consumption").notNull(),
    bestDay: timestamp("best_day", { mode: "date", withTimezone: true }).notNull(),
    bestDayConsumption: doublePrecision("best_day_consumption").notNull(),
});

export const reportsDayStatisticsTable = pgTable("reports_day_statistics", {
    id: text("id")
        .primaryKey()
        .notNull()
        .$defaultFn(() => nanoid(25)),
    date: timestamp("date", { mode: "date", withTimezone: true }).notNull(),
    dailyConsumption: doublePrecision("daily_consumption").notNull(),
    dailyGoal: doublePrecision("daily_goal"),
    exceeded: boolean("exceeded"),
    progress: doublePrecision("progress"),
    reportId: text("report_id").notNull(),
});
