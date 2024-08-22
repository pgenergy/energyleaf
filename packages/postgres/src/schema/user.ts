import { Versions } from "@energyleaf/lib/versioning";
import { sql } from "drizzle-orm";
import { boolean, doublePrecision, integer, pgTable, smallint, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

const userFields = {
    id: text("id")
        .primaryKey()
        .notNull()
        .$defaultFn(() => nanoid(30)),
    created: timestamp("created", { mode: "date", withTimezone: true }).default(sql`now()`),
    email: text("email").notNull(),
    phone: text("phone"),
    address: text("address").notNull().default(""),
    firstname: text("firstname").notNull().default(""),
    lastname: text("lastname").notNull().default(""),
    username: text("username").notNull(),
    password: text("password").notNull(),
    isAdmin: boolean("is_admin").default(false).notNull(),
    isActive: boolean("is_active").default(false).notNull(),
    isParticipant: boolean("is_participant").default(false).notNull(),
    onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
    appVersion: smallint("app_version").default(Versions.transparency).notNull(),
    receiveAnomalyMails: boolean("receive_anomaly_mails").default(true).notNull(),
    activationDate: timestamp("activation_date", { mode: "date", withTimezone: true }),
};

export const user = pgTable("user", {
    ...userFields,
});

export const historyUser = pgTable("history_user", {
    ...userFields,
});

export const userExperimentData = pgTable("user_experiment_data", {
    userId: text("user_id").notNull().primaryKey(),
    experimentStatus: text("experiment_status", {
        enum: [
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
        ],
    }),
    installationDate: timestamp("installation_date", { mode: "date", withTimezone: true }),
    deinstallationDate: timestamp("deinstallation_date", { mode: "date", withTimezone: true }),
    experimentNumber: integer("experiment_number"),
    getsPaid: boolean("gets_paid").default(false).notNull(),
    usesProlific: boolean("uses_prolific").default(false).notNull(),
});

const userDataFields = {
    id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity(),
    userId: text("user_id").notNull(),
    timestamp: timestamp("timestamp", { mode: "date", withTimezone: true }).default(sql`now()`).notNull(),
    basePrice: doublePrecision("base_price"),
    workingPrice: doublePrecision("working_price"),
    tariff: text("tariff", { enum: ["basic", "eco"] }).default("basic"),
    household: integer("household"),
    property: text("property", { enum: ["house", "apartment"] }),
    livingSpace: integer("living_space"),
    hotWater: text("hot_water", { enum: ["electric", "not_electric"] }),
    monthlyPayment: integer("advance_payment_electricity"),
    consumptionGoal: doublePrecision("consumption_goal"),
    electricityMeterNumber: text("electricity_meter_number"),
    electricityMeterType: text("electricity_meter_type", { enum: ["digital", "analog"] }),
    electricityMeterImgUrl: text("electricity_meter_img_url"),
    powerAtElectricityMeter: boolean("power_at_electricity_meter").default(false),
    wifiAtElectricityMeter: boolean("wifi_at_electricity_meter").default(false),
    installationComment: text("installation_comment"),
    devicePowerEstimationRSquared: doublePrecision("device_power_estimation_r_squared"),
};

export const userData = pgTable("user_data", {
    ...userDataFields,
});

export const historyUserData = pgTable("history_user_data", {
    ...userDataFields,
});

export const userTipOfTheDay = pgTable("user_tip_of_the_day", {
    userId: text("user_id").primaryKey().notNull(),
    tipId: integer("tip_id").notNull(),
    timestamp: timestamp("date", { mode: "date", withTimezone: true }).notNull(),
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
});

export const token = pgTable("token", {
    token: text("id")
        .primaryKey()
        .$defaultFn(() => nanoid(30)),
    userId: text("user_id").notNull(),
    createdTimestamp: timestamp("created_timestamp", { mode: "date", withTimezone: true })
        .default(sql`now()`)
        .notNull(),
});
