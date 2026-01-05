import { sql } from "drizzle-orm";
import { index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { genID } from "@/lib/utils";
import { numericType } from "../types";

/**
 * Stores 15-minute interval spot prices from SMARD.de (EPEX day-ahead market)
 * Prices are in €/MWh for the Germany/Luxembourg bidding zone
 */
export const spotPriceTable = pgTable(
	"spot_price",
	{
		id: text("id")
			.primaryKey()
			.notNull()
			.$defaultFn(() => genID(25)),
		timestamp: timestamp("timestamp", { mode: "date", withTimezone: true }).notNull(),
		priceEurMwh: numericType("price_eur_mwh").notNull(),
		createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).default(sql`now()`).notNull(),
	},
	(table) => [
		uniqueIndex("spot_price_timestamp_idx").on(table.timestamp),
		index("spot_price_timestamp_range_idx").on(table.timestamp),
	],
);

export type SpotPrice = typeof spotPriceTable.$inferSelect;
