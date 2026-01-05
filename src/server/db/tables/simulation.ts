import { sql } from "drizzle-orm";
import { boolean, json, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import {
	ChargingSpeed,
	type ChargingSpeedValue,
	HeatPumpSource,
	type HeatPumpSourceValue,
	SolarOrientation,
	type SolarOrientationValue,
} from "@/lib/enums";
import { genID } from "@/lib/utils";
import { numericType } from "../types";
import { userTable } from "./user";

export type TouTariffZone = {
	start: string;
	end: string;
	price: number;
};

export type TouWeekdayZones = {
	monday?: TouTariffZone[] | null;
	tuesday?: TouTariffZone[] | null;
	wednesday?: TouTariffZone[] | null;
	thursday?: TouTariffZone[] | null;
	friday?: TouTariffZone[] | null;
	saturday?: TouTariffZone[] | null;
	sunday?: TouTariffZone[] | null;
};

export type EvChargingTimeSlot = {
	start: string;
	end: string;
};

export type EvWeekdaySchedules = {
	monday?: EvChargingTimeSlot[] | null;
	tuesday?: EvChargingTimeSlot[] | null;
	wednesday?: EvChargingTimeSlot[] | null;
	thursday?: EvChargingTimeSlot[] | null;
	friday?: EvChargingTimeSlot[] | null;
	saturday?: EvChargingTimeSlot[] | null;
	sunday?: EvChargingTimeSlot[] | null;
};

export type HeatingTimeSlot = {
	start: string;
	end: string;
	targetTemperature: number;
};

export type HeatingWeekdaySchedules = {
	monday?: HeatingTimeSlot[] | null;
	tuesday?: HeatingTimeSlot[] | null;
	wednesday?: HeatingTimeSlot[] | null;
	thursday?: HeatingTimeSlot[] | null;
	friday?: HeatingTimeSlot[] | null;
	saturday?: HeatingTimeSlot[] | null;
	sunday?: HeatingTimeSlot[] | null;
};

export const simulationEvSettingsTable = pgTable("simulation_ev_settings", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => genID(30)),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id, { onDelete: "cascade" })
		.unique(),
	enabled: boolean("enabled").notNull().default(true),
	chargingSpeed: text("charging_speed", { enum: Object.values(ChargingSpeed) as [ChargingSpeedValue] }).notNull(),
	evCapacityKwh: numericType("capacity_kwh").notNull(),
	maxChargingPowerKw: numericType("max_charging_power_kw").notNull().default(11),
	dailyDrivingDistanceKm: numericType("daily_driving_distance_km"),
	avgConsumptionPer100Km: numericType("avg_consumption_per_100km"),
	defaultSchedule: json("default_schedule").$type<EvChargingTimeSlot[]>().notNull().default([]),
	weekdaySchedules: json("weekday_schedules").$type<EvWeekdaySchedules>().notNull().default({}),
	createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
		.default(sql`now()`)
		.$onUpdateFn(() => new Date())
		.notNull(),
});

export type SimulationEvSettings = typeof simulationEvSettingsTable.$inferSelect;

export const simulationSolarSettingsTable = pgTable("simulation_solar_settings", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => genID(30)),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id, { onDelete: "cascade" })
		.unique(),
	enabled: boolean("enabled").notNull().default(true),
	peakPower: numericType("peak_power").notNull(),
	orientation: text("orientation", { enum: Object.values(SolarOrientation) as [SolarOrientationValue] }).notNull(),
	inverterPower: numericType("inverter_power"),
	sunHoursPerDay: numericType("sun_hours_per_day"),
	createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
		.default(sql`now()`)
		.$onUpdateFn(() => new Date())
		.notNull(),
});

export type SimulationSolarSettings = typeof simulationSolarSettingsTable.$inferSelect;

export const simulationHeatPumpSettingsTable = pgTable("simulation_heat_pump_settings", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => genID(30)),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id, { onDelete: "cascade" })
		.unique(),
	enabled: boolean("enabled").notNull().default(true),
	source: text("source", { enum: Object.values(HeatPumpSource) as [HeatPumpSourceValue] }).notNull(),
	powerKw: numericType("power_kw").notNull(),
	bufferLiter: numericType("buffer_liter"),
	defaultSchedule: json("default_schedule").$type<HeatingTimeSlot[]>().notNull().default([]),
	weekdaySchedules: json("weekday_schedules").$type<HeatingWeekdaySchedules>().notNull().default({}),
	createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
		.default(sql`now()`)
		.$onUpdateFn(() => new Date())
		.notNull(),
});

export type SimulationHeatPumpSettings = typeof simulationHeatPumpSettingsTable.$inferSelect;

export type PricingMode = "tou" | "spot";

export const simulationTouTariffSettingsTable = pgTable("simulation_tou_tariff_settings", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => genID(30)),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id, { onDelete: "cascade" })
		.unique(),
	enabled: boolean("enabled").notNull().default(true),
	// Pricing mode: "tou" for time-of-use zones, "spot" for SMARD exchange prices
	pricingMode: text("pricing_mode", { enum: ["tou", "spot"] })
		.$type<PricingMode>()
		.notNull()
		.default("tou"),
	basePrice: numericType("base_price").notNull(),
	standardPrice: numericType("standard_price").notNull(),
	zones: json("zones").$type<TouTariffZone[]>().notNull().default([]),
	weekdayZones: json("weekday_zones").$type<TouWeekdayZones>().notNull().default({}),
	// Spot pricing: provider markup in ct/kWh added to exchange price
	spotMarkup: numericType("spot_markup").default(3),
	createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
		.default(sql`now()`)
		.$onUpdateFn(() => new Date())
		.notNull(),
});

export type SimulationTouTariffSettings = typeof simulationTouTariffSettingsTable.$inferSelect;

export const simulationBatterySettingsTable = pgTable("simulation_battery_settings", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => genID(30)),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id, { onDelete: "cascade" })
		.unique(),
	enabled: boolean("enabled").notNull().default(true),
	capacityKwh: numericType("capacity_kwh").notNull(),
	maxPowerKw: numericType("max_power_kw").notNull(),
	createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
		.default(sql`now()`)
		.$onUpdateFn(() => new Date())
		.notNull(),
});

export type SimulationBatterySettings = typeof simulationBatterySettingsTable.$inferSelect;
