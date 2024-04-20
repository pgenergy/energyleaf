import { sql } from "drizzle-orm";
import {
    boolean,
    datetime,
    float,
    int,
    mysqlEnum,
    mysqlTable,
    smallint,
    timestamp,
    varchar,
} from "drizzle-orm/mysql-core";
import { nanoid } from "nanoid";

import { Versions } from "@energyleaf/lib/versioning";

export const user = mysqlTable("user", {
    id: varchar("id", { length: 30 })
        .primaryKey()
        .notNull()
        .$defaultFn(() => nanoid(30)),
    created: timestamp("created").default(sql`CURRENT_TIMESTAMP`),
    email: varchar("email", { length: 256 }).notNull(),
    username: varchar("username", { length: 30 }).notNull(),
    password: varchar("password", { length: 256 }).notNull(),
    isAdmin: boolean("is_admin").default(false).notNull(),
    isActive: boolean("is_active").default(false).notNull(),
    onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
    appVersion: smallint("app_version").default(Versions.transparency).notNull(),
});

export const userData = mysqlTable("user_data", {
    id: int("id").autoincrement().primaryKey().notNull(),
    userId: varchar("user_id", { length: 30 }).notNull(),
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
    consumptionGoal: int("consumption_goal"),
});

export const session = mysqlTable("session", {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 30 }).notNull(),
    expiresAt: datetime("expires_at").notNull(),
});

export const historyUserData = mysqlTable("history_user_data", {
    id: int("id").autoincrement().primaryKey().notNull(),
    userId: varchar("user_id", { length: 30 }).notNull(),
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
    consumptionGoal: int("consumption_goal"),
});

export const token = mysqlTable("token", {
    token: varchar("id", { length: 30 })
        .primaryKey()
        .$defaultFn(() => nanoid(30)),
    userId: varchar("user_id", { length: 30 }).notNull(),
    type: mysqlEnum("type", ["report"]).notNull(),
    created: datetime("created")
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});
