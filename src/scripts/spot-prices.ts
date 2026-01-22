import { desc, sql } from "drizzle-orm";
import { db } from "../server/db";
import { spotPriceTable } from "../server/db/tables/spot-price";
import { fetchSmardPrices, getSmardFetchRange, type SpotPriceEntry } from "../server/lib/smard";

/**
 * Test script for fetching and inserting SMARD spot price data.
 *
 * Usage: bun run src/scripts/spot-prices.ts
 */

async function getLatestTimestamp(): Promise<Date | null> {
	const result = await db
		.select({ timestamp: spotPriceTable.timestamp })
		.from(spotPriceTable)
		.orderBy(desc(spotPriceTable.timestamp))
		.limit(1);
	return result[0]?.timestamp ?? null;
}

async function getCount(): Promise<number> {
	const result = await db.select({ count: sql<number>`count(*)::int` }).from(spotPriceTable);
	return result[0]?.count ?? 0;
}

async function testSmardFetch() {
	console.log("=".repeat(60));
	console.log("SMARD Spot Price Fetch Test");
	console.log("=".repeat(60));

	// Step 1: Check current state
	console.log("\n[1] Checking current database state...");
	const latestTimestamp = await getLatestTimestamp();
	const count = await getCount();
	console.log(`   - Current spot price count: ${count}`);
	console.log(`   - Latest timestamp: ${latestTimestamp?.toISOString() ?? "none"}`);

	// Step 2: Determine fetch range
	console.log("\n[2] Determining fetch range...");
	const { from, to } = getSmardFetchRange(latestTimestamp);
	console.log(`   - Fetch from: ${from.toISOString()}`);
	console.log(`   - Fetch to:   ${to.toISOString()}`);

	// Step 3: Fetch data from SMARD
	console.log("\n[3] Fetching data from SMARD API...");
	let entries: SpotPriceEntry[];
	try {
		entries = await fetchSmardPrices(from, to);
		console.log(`   - Fetched ${entries.length} price entries`);
	} catch (err) {
		console.error("   - Error fetching from SMARD:", err);
		process.exit(1);
	}

	if (entries.length === 0) {
		console.log("   - No entries to insert, exiting.");
		process.exit(0);
	}

	// Step 4: Display sample entries
	console.log("\n[4] Sample entries (first 5):");
	for (const entry of entries.slice(0, 5)) {
		console.log(`   - ${entry.timestamp.toISOString()} => ${entry.priceEurMwh.toFixed(2)} €/MWh`);
	}

	// Show price statistics
	const prices = entries.map((e) => e.priceEurMwh);
	const minPrice = Math.min(...prices);
	const maxPrice = Math.max(...prices);
	const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
	console.log("\n[5] Price statistics:");
	console.log(`   - Min: ${minPrice.toFixed(2)} €/MWh (${(minPrice / 10).toFixed(2)} ct/kWh)`);
	console.log(`   - Max: ${maxPrice.toFixed(2)} €/MWh (${(maxPrice / 10).toFixed(2)} ct/kWh)`);
	console.log(`   - Avg: ${avgPrice.toFixed(2)} €/MWh (${(avgPrice / 10).toFixed(2)} ct/kWh)`);

	// Step 5: Insert into database
	console.log("\n[6] Inserting into database...");
	const BATCH_SIZE = 100;
	let inserted = 0;

	for (let i = 0; i < entries.length; i += BATCH_SIZE) {
		const batch = entries.slice(i, i + BATCH_SIZE);

		await db
			.insert(spotPriceTable)
			.values(
				batch.map((entry) => ({
					timestamp: entry.timestamp,
					priceEurMwh: entry.priceEurMwh,
				})),
			)
			.onConflictDoUpdate({
				target: spotPriceTable.timestamp,
				set: {
					priceEurMwh: sql`EXCLUDED.price_eur_mwh`,
				},
			});

		inserted += batch.length;
		process.stdout.write(`\r   - Progress: ${inserted}/${entries.length}`);
	}
	console.log("\n   - Done!");

	// Step 6: Verify
	console.log("\n[7] Verifying insertion...");
	const newCount = await getCount();
	const newLatest = await getLatestTimestamp();
	console.log(`   - New spot price count: ${newCount} (was ${count})`);
	console.log(`   - New latest timestamp: ${newLatest?.toISOString() ?? "none"}`);

	// Step 7: Query sample from database
	console.log("\n[8] Sample from database (last 5 entries):");
	const recentEntries = await db.select().from(spotPriceTable).orderBy(desc(spotPriceTable.timestamp)).limit(5);

	for (const entry of recentEntries) {
		console.log(`   - ${entry.timestamp.toISOString()} => ${entry.priceEurMwh.toFixed(2)} €/MWh`);
	}

	console.log(`\n${"=".repeat(60)}`);
	console.log("Test completed successfully!");
	console.log("=".repeat(60));
}

testSmardFetch()
	.then(() => {})
	.catch((err) => {
		console.error("\nFatal error:", err);
		process.exit(1);
	})
	.finally(() => process.exit(0));
