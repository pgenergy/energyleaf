import { sql } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
	unique,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { SensorType, type SensorTypeValue } from "@/lib/enums";
import { genID } from "@/lib/utils";
import { numericType } from "../types";
import { userTable } from "./user";

export const sensorTable = pgTable(
	"sensor",
	{
		id: text("sensor_id").notNull().unique(),
		clientId: text("client_id").primaryKey().notNull(),
		version: integer("version").default(1).notNull(),
		sensorType: text("sensor_type", { enum: Object.values(SensorType) as [SensorTypeValue] }).notNull(),
		userId: text("user_id").references(() => userTable.id, { onDelete: "set null" }),
		needsScript: boolean("needs_script").default(false).notNull(),
		script: text("script"),
	},
	(table) => {
		return [
			{
				unq: unique().on(table.sensorType, table.userId),
			},
		];
	},
);

export type Sensor = typeof sensorTable.$inferSelect;

export const sensorHistoryTable = pgTable(
	"sensor_history",
	{
		sensorId: text("sensor_id").notNull(),
		userId: text("user_id").notNull(),
		sensorType: text("sensor_type", { enum: Object.values(SensorType) as [SensorTypeValue] }).notNull(),
		clientId: text("client_id").notNull(),
	},
	(table) => {
		return [
			{
				pk: primaryKey({ columns: [table.clientId, table.userId] }),
			},
		];
	},
);

export const sensorTokenTable = pgTable(
	"sensor_token",
	{
		code: text("code")
			.notNull()
			.primaryKey()
			.$defaultFn(() => genID(30)),
		sensorId: text("sensor_id")
			.notNull()
			.references(() => sensorTable.id, { onDelete: "cascade" }),
		timestamp: timestamp("timestamp").default(sql`now()`),
	},
	(table) => {
		return [
			{
				sensorIdIdx: index("sensor_id_idx_sensor_token").on(table.sensorId),
			},
		];
	},
);

export type SensorToken = typeof sensorTokenTable.$inferSelect;

export const energyDataTable = pgTable(
	"energy_data",
	{
		id: text("id")
			.notNull()
			.$defaultFn(() => genID(35)),
		sensorId: text("sensor_id").notNull(),
		value: numericType("value").notNull(),
		consumption: numericType("consumption").notNull(),
		valueOut: numericType("value_out"),
		inserted: numericType("inserted"),
		valueCurrent: numericType("value_current"),
		timestamp: timestamp("timestamp", { mode: "date", withTimezone: true }).notNull().default(sql`now()`),
	},
	(table) => {
		return [
			{
				pk: primaryKey({ columns: [table.sensorId, table.timestamp] }),
			},
		];
	},
);

export type EnergyData = typeof energyDataTable.$inferSelect;

const sequenceTypes = ["peak", "anomaly"] as const;

export const energyDataSequenceTable = pgTable(
	"energy_data_sequence",
	{
		id: text("id")
			.primaryKey()
			.notNull()
			.$defaultFn(() => genID(25)),
		sensorId: text("sensor_id").notNull(),
		start: timestamp("start", { mode: "date", withTimezone: true }).notNull(),
		end: timestamp("end", { mode: "date", withTimezone: true }).notNull(),
		type: text("type", { enum: sequenceTypes }).notNull(),
		averagePeakPower: numericType("average_peak_power").notNull(),
	},
	(table) => {
		return [
			{
				uniqueIdxStart: uniqueIndex("senor_data_sequence_sensor_id_start").on(table.sensorId, table.start),
				uniqueIdxEnd: uniqueIndex("senor_data_sequence_sensor_id_end").on(table.sensorId, table.end),
				index: index("senor_data_sequence_sensor_id").on(table.sensorId, table.start, table.end),
			},
		];
	},
);

export type EnergyDataSequence = typeof energyDataSequenceTable.$inferSelect;

export const sensorAdditionalUserTable = pgTable(
	"sensor_additional_user",
	{
		sensorId: text("sensor_id")
			.notNull()
			.references(() => sensorTable.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" }),
	},
	(table) => {
		return [
			{
				pk: primaryKey({ columns: [table.sensorId, table.userId] }),
			},
		];
	},
);

export type SensorAdditionalUser = typeof sensorAdditionalUserTable.$inferSelect;
