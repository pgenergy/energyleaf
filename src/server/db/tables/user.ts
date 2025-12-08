import { sql } from "drizzle-orm";
import { boolean, doublePrecision, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import {
	ElectricityMeter,
	type ElectricityMeterValue,
	ExperimentPhase,
	type ExperimentPhaseValue,
	HouseType,
	type HouseTypeValue,
	TariffType,
	type TariffTypeValue,
	TimeZoneType,
	type TimezoneTypeValue,
	WaterType,
	type WaterTypeValue,
} from "@/lib/enums";
import { genID } from "@/lib/utils";
import { numericType } from "../types";

export const userTable = pgTable("user", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => genID(30)),
	created: timestamp("created", { mode: "date", withTimezone: true }).default(sql`now()`),
	phone: text("phone"),
	address: text("address").notNull().default(""),
	firstname: text("firstname").notNull().default(""),
	lastname: text("lastname").notNull().default(""),
	username: text("username").notNull(),
	email: text("email").notNull().unique(),
	password: text("password").notNull(),
	isAdmin: boolean("is_admin").default(false).notNull(),
	isActive: boolean("is_active").default(false).notNull(),
	isParticipant: boolean("is_participant").default(false).notNull(),
	isSimulationFree: boolean("is_simulation_free").default(false).notNull(),
	onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
	activationDate: timestamp("activation_date", { mode: "date", withTimezone: true }),
	deleted: boolean("deleted").default(false).notNull(),
	timezone: text("user_timezone", { enum: Object.values(TimeZoneType) as [TimezoneTypeValue] }).default(
		TimeZoneType.Europe_Berlin,
	),
});

export type User = typeof userTable.$inferSelect;

export const userExperimentDataTable = pgTable("user_experiment_data", {
	userId: text("user_id").notNull().primaryKey(),
	experimentStatus: text("experiment_status", { enum: Object.values(ExperimentPhase) as [ExperimentPhaseValue] }),
	installationDate: timestamp("installation_date", { mode: "date", withTimezone: true }),
	deinstallationDate: timestamp("deinstallation_date", { mode: "date", withTimezone: true }),
	experimentNumber: integer("experiment_number"),
	getsPaid: boolean("gets_paid").default(false).notNull(),
	usesProlific: boolean("uses_prolific").default(false).notNull(),
});

export type UserExperimentData = typeof userExperimentDataTable.$inferSelect;

export const userDataTable = pgTable("user_data", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => genID(30)),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id, { onDelete: "cascade" }),
	timestamp: timestamp("timestamp", { mode: "date", withTimezone: true }).default(sql`now()`).notNull(),
	basePrice: doublePrecision("base_price"),
	workingPrice: doublePrecision("working_price"),
	tariff: text("tariff", { enum: Object.values(TariffType) as [TariffTypeValue] }).default(TariffType.Basic),
	household: integer("household"),
	property: text("property", { enum: Object.values(HouseType) as [HouseTypeValue] }),
	livingSpace: doublePrecision("living_space"),
	hotWater: text("hot_water", { enum: Object.values(WaterType) as [WaterTypeValue] }),
	monthlyPayment: doublePrecision("advance_payment_electricity"),
	consumptionGoal: doublePrecision("consumption_goal"),
	electricityMeterNumber: text("electricity_meter_number"),
	electricityMeterType: text("electricity_meter_type", {
		enum: Object.values(ElectricityMeter) as [ElectricityMeterValue],
	}),
	electricityMeterImgUrl: text("electricity_meter_img_url"),
	powerAtElectricityMeter: boolean("power_at_electricity_meter").default(false),
	wifiAtElectricityMeter: boolean("wifi_at_electricity_meter").default(false),
	installationComment: text("installation_comment"),
	devicePowerEstimationRSquared: doublePrecision("device_power_estimation_r_squared"),
	currentEnergyThreshold: numericType("current_energy_threshold"),
});

export type UserData = typeof userDataTable.$inferSelect;

export const sessionTable = pgTable("session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id, { onDelete: "cascade" }),
	expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
});

export type Session = typeof sessionTable.$inferSelect;

export const tokenTable = pgTable("token", {
	token: text("id")
		.primaryKey()
		.$defaultFn(() => genID(30)),
	type: text("type", { enum: ["password_reset"] }),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id, { onDelete: "cascade" }),
	createdTimestamp: timestamp("created_timestamp", { mode: "date", withTimezone: true })
		.default(sql`now()`)
		.notNull(),
});

export type Token = typeof tokenTable.$inferSelect;
