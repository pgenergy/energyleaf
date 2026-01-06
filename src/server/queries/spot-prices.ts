import "server-only";

import { toZonedTime } from "date-fns-tz";
import { and, desc, gte, lt, lte, sql } from "drizzle-orm";
import { cache } from "react";
import { TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
import { db } from "../db";
import { type SpotPrice, spotPriceTable } from "../db/tables/spot-price";

/**
 * Get spot prices for a date range.
 * Prices are returned in chronological order.
 */
export const getSpotPricesForRange = cache(async (start: Date, end: Date): Promise<SpotPrice[]> => {
	return db
		.select()
		.from(spotPriceTable)
		.where(and(gte(spotPriceTable.timestamp, start), lte(spotPriceTable.timestamp, end)))
		.orderBy(spotPriceTable.timestamp);
});

/**
 * Get the most recent spot price timestamp in the database.
 * Returns null if no spot prices exist.
 */
export async function getLatestSpotPriceTimestamp(): Promise<Date | null> {
	const result = await db
		.select({ timestamp: spotPriceTable.timestamp })
		.from(spotPriceTable)
		.orderBy(desc(spotPriceTable.timestamp))
		.limit(1);
	return result[0]?.timestamp ?? null;
}

/**
 * Get the total count of spot prices in the database.
 */
export async function getSpotPriceCount(): Promise<number> {
	const result = await db.select({ count: sql<number>`count(*)::int` }).from(spotPriceTable);
	return result[0]?.count ?? 0;
}

/**
 * Get the last known spot price before a given timestamp.
 * Used as fallback when no exact match is found.
 *
 * @param before The timestamp to look before
 * @returns Price in €/MWh, or null if no price exists
 */
export async function getLastKnownSpotPrice(before: Date): Promise<number | null> {
	const result = await db
		.select({ price: spotPriceTable.priceEurMwh })
		.from(spotPriceTable)
		.where(lt(spotPriceTable.timestamp, before))
		.orderBy(desc(spotPriceTable.timestamp))
		.limit(1);
	return result[0]?.price ?? null;
}

/**
 * Build a Map of timestamp (ms) to price (€/MWh) for efficient lookups.
 * Spot prices are stored in 15-minute intervals in UTC.
 * The timestamps are shifted to the user's timezone to match energy data timestamps.
 */
export function buildSpotPriceMap(spotPrices: SpotPrice[], timezone?: string): Map<number, number> {
	const map = new Map<number, number>();
	const tz = timezone ?? TimezoneTypeToTimeZone[TimeZoneType.Europe_Berlin];

	for (const sp of spotPrices) {
		// Shift spot price timestamp to user timezone to match energy data
		const zonedTime = toZonedTime(sp.timestamp, tz);
		map.set(zonedTime.getTime(), sp.priceEurMwh);
	}
	return map;
}

/**
 * Find the spot price for a given timestamp.
 * Rounds down to the nearest 15-minute interval.
 *
 * @returns Price in €/MWh, or null if not found and no fallback
 */
export function getSpotPriceForTimestamp(
	timestamp: Date,
	priceMap: Map<number, number>,
	fallbackPriceEurMwh?: number,
): number | null {
	// Round down to nearest 15-minute interval
	const ms = timestamp.getTime();
	const fifteenMinMs = 15 * 60 * 1000;
	const slotMs = Math.floor(ms / fifteenMinMs) * fifteenMinMs;

	const price = priceMap.get(slotMs);
	if (price !== undefined) {
		return price;
	}

	return fallbackPriceEurMwh ?? null;
}
