import { sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { spotPriceTable } from "@/server/db/tables/spot-price";
import { fetchSmardPrices, getSmardFetchRange } from "@/server/lib/smard";
import { getSecretKeyUncached } from "@/server/queries/config";
import { getLatestSpotPriceTimestamp } from "@/server/queries/spot-prices";

/**
 * GET /api/spot-prices
 *
 * Fetches spot prices from SMARD.de and stores them in the database.
 * Called by pg_cron daily to keep prices up to date.
 *
 * On first run (no data): backfills last 7 days
 * On subsequent runs: fetches current day + next day (day-ahead)
 */
export async function GET(req: NextRequest) {
	const secretKey = await getSecretKeyUncached();
	if (!secretKey || !req.headers.has("authorization") || req.headers.get("authorization") !== `Bearer ${secretKey}`) {
		return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
	}

	try {
		// Determine fetch range based on existing data
		const latestTimestamp = await getLatestSpotPriceTimestamp();
		const { from, to } = getSmardFetchRange(latestTimestamp);

		console.log(
			`[spot-prices] Fetching prices from ${from.toISOString()} to ${to.toISOString()}`,
			latestTimestamp ? `(last entry: ${latestTimestamp.toISOString()})` : "(first run, backfilling 7 days)",
		);

		// Fetch prices from SMARD
		const prices = await fetchSmardPrices(from, to);

		if (prices.length === 0) {
			console.log("[spot-prices] No prices returned from SMARD");
			return NextResponse.json({
				statusMessage: "OK",
				inserted: 0,
				message: "No prices available for the requested range",
			});
		}

		console.log(`[spot-prices] Received ${prices.length} price entries from SMARD`);

		// Upsert prices into database (ON CONFLICT DO UPDATE)
		let insertedCount = 0;
		const batchSize = 100;

		for (let i = 0; i < prices.length; i += batchSize) {
			const batch = prices.slice(i, i + batchSize);

			await db
				.insert(spotPriceTable)
				.values(
					batch.map((p) => ({
						timestamp: p.timestamp,
						priceEurMwh: p.priceEurMwh,
					})),
				)
				.onConflictDoUpdate({
					target: spotPriceTable.timestamp,
					set: {
						priceEurMwh: sql`EXCLUDED.price_eur_mwh`,
					},
				});

			insertedCount += batch.length;
		}

		console.log(`[spot-prices] Upserted ${insertedCount} price entries`);

		return NextResponse.json({
			statusMessage: "OK",
			inserted: insertedCount,
			range: {
				from: from.toISOString(),
				to: to.toISOString(),
			},
		});
	} catch (error) {
		console.error("[spot-prices] Error fetching spot prices:", error);
		return NextResponse.json(
			{
				statusMessage: "Error",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
