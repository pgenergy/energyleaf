import { Versions } from "@energyleaf/lib/versioning";
import { sql } from "drizzle-orm";
import {
    boolean,
    datetime,
    float,
    int,
    mysqlEnum,
    mysqlTable,
    smallint,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/mysql-core";
import { nanoid } from "nanoid";

const userFields = {
    id: varchar("id", { length: 30 })
        .primaryKey()
        .notNull()
        .$defaultFn(() => nanoid(30)),
    created: timestamp("created").default(sql`CURRENT_TIMESTAMP`),
    email: varchar("email", { length: 256 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    address: text("address").notNull().default(""),
    firstname: varchar("firstname", { length: 30 }).notNull().default(""),
    lastname: varchar("lastname", { length: 30 }).notNull().default(""),
    username: varchar("username", { length: 30 }).notNull(),
    password: varchar("password", { length: 256 }).notNull(),
    isAdmin: boolean("is_admin").default(false).notNull(),
    isActive: boolean("is_active").default(false).notNull(),
    isParticipant: boolean("is_participant").default(false).notNull(),
    onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
    appVersion: smallint("app_version").default(Versions.transparency).notNull(),
    receiveAnomalyMails: boolean("receive_anomaly_mails").default(true).notNull(),
    activationDate: timestamp("activation_date"),
};

export const user = mysqlTable("user", {
    ...userFields,
});

export const historyUser = mysqlTable("history_user", {
    ...userFields,
});

export const userExperimentData = mysqlTable("user_experiment_data", {
    userId: varchar("user_id", { length: 30 }).notNull().primaryKey(),
    experimentStatus: mysqlEnum("experiment_status", [
        "registered",
        "approved",
        "dismissed",
        "exported",
        "first_survey",
        "first_finished",
        "installation",
        "second_survey",
        "second_finished",
        "third_survey",
        "third_finished",
        "deinstallation",
        "inactive",
    ]),
    installationDate: timestamp("installation_date"),
    deinstallationDate: timestamp("deinstallation_date"),
    experimentNumber: int("experiment_number"),
    getsPaid: boolean("gets_paid").default(false).notNull(),
});

const userDataFields = {
    id: int("id").autoincrement().primaryKey().notNull(),
    userId: varchar("user_id", { length: 30 }).notNull(),
    timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`).notNull(),
    basePrice: float("base_price"),
    workingPrice: float("working_price"),
    tariff: mysqlEnum("tariff", ["basic", "eco"]).default("basic"),
    household: int("household"),
    property: mysqlEnum("property", ["house", "apartment"]),
    livingSpace: int("living_space"),
    hotWater: mysqlEnum("hot_water", ["electric", "not_electric"]),
    monthlyPayment: int("advance_payment_electricity"),
    consumptionGoal: float("consumption_goal"),
    electricityMeterNumber: varchar("electricity_meter_number", { length: 256 }),
    electricityMeterType: mysqlEnum("electricity_meter_type", ["digital", "analog"]),
    electricityMeterImgUrl: text("electricity_meter_img_url"),
    powerAtElectricityMeter: boolean("power_at_electricity_meter").default(false),
    wifiAtElectricityMeter: boolean("wifi_at_electricity_meter").default(false),
    installationComment: text("installation_comment"),
    devicePowerEstimationRSquared: float("device_power_estimation_r_squared"),
};

export const userData = mysqlTable("user_data", {
    ...userDataFields,
});

export const historyUserData = mysqlTable("history_user_data", {
    ...userDataFields,
});

export const session = mysqlTable("session", {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 30 }).notNull(),
    expiresAt: datetime("expires_at").notNull(),
});

export const token = mysqlTable("token", {
    token: varchar("id", { length: 30 })
        .primaryKey()
        .$defaultFn(() => nanoid(30)),
    userId: varchar("user_id", { length: 30 }).notNull(),
    createdTimestamp: timestamp("created_timestamp").default(sql`CURRENT_TIMESTAMP`).notNull(),
});
