import {sql} from "drizzle-orm";
import {boolean, datetime, float, int, mysqlEnum, mysqlTable, timestamp, varchar} from "drizzle-orm/mysql-core";
import {nanoid} from "nanoid";

export const user = mysqlTable("user", {
    id: varchar("id", {length: 30})
        .primaryKey()
        .notNull()
        .$defaultFn(() => nanoid(30)),
    created: timestamp("created").default(sql`CURRENT_TIMESTAMP`),
    email: varchar("email", {length: 256}).notNull(),
    username: varchar("username", {length: 30}).notNull(),
    password: varchar("password", {length: 256}).notNull(),
    isAdmin: boolean("is_admin").default(false).notNull(),
    isActive: boolean("is_active").default(false).notNull(),
    onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
});

export const userData = mysqlTable("user_data", {
    id: int("id").autoincrement().primaryKey().notNull(),
    userId: varchar("user_id", {length: 30}).notNull(),
    timestamp: timestamp("timestamp")
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    basePrice: float("base_price"),
    workingPrice: float("working_price"),
    tariff: mysqlEnum("tariff", ["basic", "eco"]).default("basic"),
    household: int("household"),
    property: mysqlEnum("property", ["house", "apartment"]),
    livingSpace: int("living_space"),
    hotWater: mysqlEnum("hot_water", ["electric", "not_electric"]),
    monthlyPayment: int("advance_payment_electricity"),
    consumptionGoal: int("consumption_goal")
});

export const session = mysqlTable("session", {
    id: varchar("id", {length: 255}).primaryKey(),
    userId: varchar("user_id", {length: 30}).notNull(),
    expiresAt: datetime("expires_at").notNull(),
});

export const historyUserData = mysqlTable("history_user_data", {
    id: int("id").autoincrement().primaryKey().notNull(),
    userId: varchar("user_id", {length: 30}).notNull(),
    timestamp: timestamp("timestamp")
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    basePrice: float("base_price"),
    workingPrice: float("working_price"),
    tariff: mysqlEnum("tariff", ["basic", "eco"]).default("basic"),
    household: int("household"),
    property: mysqlEnum("property", ["house", "apartment"]),
    livingSpace: int("living_space"),
    hotWater: mysqlEnum("hot_water", ["electric", "not_electric"]),
    monthlyPayment: int("advance_payment_electricity"),
    consumptionGoal: int("consumption_goal")
});

export const reports = mysqlTable("reports", {
    id: int("id").autoincrement().primaryKey().notNull(),
    userId: varchar("user_id", {length: 30}).notNull(),
    receiveMails: boolean("receive_mails").default(true).notNull(),
    interval: int("interval").default(3).notNull(),
    time: int("time").default(6).notNull(),
    timestampLast: timestamp("timestamp_last").default(sql`'2020-01-01 00:00:00'`).notNull(),
    createdTimestamp: timestamp("created_timestamp")
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});

export const historyReports = mysqlTable("history_reports", {
    id: int("id").autoincrement().primaryKey().notNull(),
    userId: varchar("user_id", {length: 30}).notNull(),
    receiveMails: boolean("receive_mails").default(true).notNull(),
    interval: int("interval").default(3).notNull(),
    time: int("time").default(6).notNull(),
    timestampLast: timestamp("timestamp_last").default(sql`'2020-01-01 00:00:00'`).notNull(),
    createdTimestamp: timestamp("created_timestamp")
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});