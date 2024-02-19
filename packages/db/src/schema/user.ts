import { sql } from "drizzle-orm";
import { boolean, float, int, mysqlEnum, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const user = mysqlTable("user", {
    id: int("id").autoincrement().primaryKey().notNull(),
    created: timestamp("created").default(sql`CURRENT_TIMESTAMP`),
    email: varchar("email", { length: 256 }).notNull(),
    username: varchar("username", { length: 30 }).notNull(),
    password: varchar("password", { length: 256 }).notNull(),
    isAdmin: boolean("is_admin").default(false).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
});

export const userData = mysqlTable("user_data", {
    id: int("id").autoincrement().primaryKey().notNull(),
    userId: int("user_id").notNull(),
    timestamp: timestamp("timestamp")
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    budget: int("budget").default(2500),
    basePrice: float("base_price"),
    workingPrice: float("working_price"),
    tariff: mysqlEnum("tariff", ["basic", "eco"]).default("basic"),
    limitEnergy: int("limit_energy").default(800),
    household: int("household"),
    property: mysqlEnum("property", ["house", "apartment"]),
    livingSpace: int("living_space"),
    hotWater: mysqlEnum("hot_water", ["electric", "not_electric"]),
    monthlyPayment: int("advance_payment_electricity"),
});

export const historyUserData = mysqlTable("history_user_data", {
    id: int("id").autoincrement().primaryKey().notNull(),
    userId: int("user_id").notNull(),
    timestamp: timestamp("timestamp")
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    budget: int("budget").default(2500),
    basePrice: float("base_price"),
    workingPrice: float("working_price"),
    tariff: mysqlEnum("tariff", ["basic", "eco"]).default("basic"),
    limitEnergy: int("limit_energy").default(800),
    household: int("household"),
    property: mysqlEnum("property", ["house", "apartment"]),
    livingSpace: int("living_space"),
    hotWater: mysqlEnum("hot_water", ["electric", "not_electric"]),
    monthlyPayment: int("advance_payment_electricity"),
});

export const userDataTariffEnums: Record<(typeof userData.tariff.enumValues)[number], string> = {
    basic: "BasisStrom",
    eco: "ÖkoStrom",
};

export const userDataPropertyEnums: Record<(typeof userData.property.enumValues)[number], string> = {
    house: "Haus",
    apartment: "Wohnung",
};

export const userDataHotWaterEnums: Record<(typeof userData.hotWater.enumValues)[number], string> = {
    electric: "Elektrisch",
    not_electric: "Nicht elektrisch",
};

export const mail = mysqlTable("mail", {
    id: int("id").autoincrement().primaryKey().notNull(),
    userId: int("user_id").notNull(),
    mailDaily: boolean("mail_daily").default(true).notNull(),
    mailWeekly: boolean("mail_weekly").default(true).notNull(),
});
