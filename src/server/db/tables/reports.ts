import { genID } from "@/lib/utils";
import { sql } from "drizzle-orm";
import { boolean, json, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { userTable } from "./user";

export const reportConfigTable = pgTable("report_config", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => genID(30)),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id, { onDelete: "cascade" }),
	reports: boolean("receive_mails").default(true).notNull(),
	anomaly: boolean("anomaly").default(false).notNull(),
	days: json("days").default([]).$type<number[]>(),
});

export type ReportConfig = typeof reportConfigTable.$inferSelect;

export const reportsTable = pgTable("reports", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => genID(30)),
	timestamp: timestamp("timestamp", { mode: "date", withTimezone: true })
		.default(sql`now()`)
		.notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id, { onDelete: "cascade" }),
	data: json("data").notNull().$type<DayReport>(),
});

export type DayReport = {
	totalEnergyConsumption: number;
	avgEnergyConsumptionPerDay: number;
	totalEnergyCost: number;
	avgEnergyCost: number;
	worstDay: string;
	worstDayConsumption: number;
	bestDay: string;
	bestDayConsumption: number;
	days: {
		timestamp: string;
		consumption: number;
		cost: number;
		goal: number;
		exceeded: boolean;
		progress: number;
	}[];
};
export type Report = typeof reportsTable.$inferSelect;
