import { sql } from "drizzle-orm";
import { boolean, doublePrecision, json, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { genID } from "@/lib/utils";
import type { TouTariffZone, TouWeekdayZones } from "./simulation";

export const touTariffTemplateTable = pgTable("tou_tariff_template", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => genID(30)),
	name: text("name").notNull().unique(),
	description: text("description"),
	basePrice: doublePrecision("base_price").notNull(),
	standardPrice: doublePrecision("standard_price").notNull(),
	zones: json("zones").$type<TouTariffZone[]>().notNull().default([]),
	weekdayZones: json("weekday_zones").$type<TouWeekdayZones>().notNull().default({}),
	isActive: boolean("is_active").notNull().default(true),
	createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
		.default(sql`now()`)
		.$onUpdateFn(() => new Date())
		.notNull(),
});

export type TouTariffTemplate = typeof touTariffTemplateTable.$inferSelect;
