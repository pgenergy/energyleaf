import { fromZonedTime } from "date-fns-tz";

const SMARD_API_URL = "https://www.smard.de/nip-download-manager/nip/download/market-data";

// Module ID for Day-ahead prices Germany/Luxembourg (€/MWh)
const SPOT_PRICE_MODULE_ID = 8004169;

interface SmardRequestForm {
	format: "CSV";
	moduleIds: number[];
	region: "DE";
	timestamp_from: number;
	timestamp_to: number;
	type: "discrete";
	language: "de";
	resolution: "quarterhour";
}

interface SmardRequestBody {
	request_form: SmardRequestForm[];
}

export interface SpotPriceEntry {
	timestamp: Date;
	priceEurMwh: number;
}

/**
 * Fetches spot prices from SMARD.de for the given date range.
 * Prices are for the Germany/Luxembourg day-ahead market in €/MWh.
 *
 * @param from Start date (inclusive)
 * @param to End date (inclusive)
 * @returns Array of spot price entries with UTC timestamps
 */
export async function fetchSmardPrices(from: Date, to: Date): Promise<SpotPriceEntry[]> {
	const body: SmardRequestBody = {
		request_form: [
			{
				format: "CSV",
				moduleIds: [SPOT_PRICE_MODULE_ID],
				region: "DE",
				timestamp_from: from.getTime(),
				timestamp_to: to.getTime(),
				type: "discrete",
				language: "de",
				resolution: "quarterhour",
			},
		],
	};

	const response = await fetch(SMARD_API_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		throw new Error(`SMARD API error: ${response.status} ${response.statusText}`);
	}

	const csvText = await response.text();
	return parseSmardCsv(csvText);
}

/**
 * Parses SMARD CSV format into spot price entries.
 *
 * CSV format (German):
 * - Semicolon delimiter
 * - Comma decimal separator
 * - Header: "Datum von;Datum bis;Deutschland/Luxemburg [€/MWh] Originalauflösungen"
 * - Date format: DD.MM.YYYY HH:mm
 * - Missing prices shown as "-"
 *
 * @param csv Raw CSV text from SMARD API
 * @returns Parsed spot price entries with valid prices only
 */
function parseSmardCsv(csv: string): SpotPriceEntry[] {
	const lines = csv.split("\n");
	const entries: SpotPriceEntry[] = [];

	// Skip header line (first line)
	for (let i = 1; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue;

		// Format: "26.12.2025 00:00;26.12.2025 00:15;106,45"
		const parts = line.split(";");
		if (parts.length < 3) continue;

		const dateFrom = parts[0].trim();
		const priceStr = parts[2].trim();

		// Skip entries without valid price (shown as "-")
		if (!priceStr || priceStr === "-") continue;

		// Parse German date format: DD.MM.YYYY HH:mm
		const timestamp = parseGermanDateTime(dateFrom);
		if (!timestamp) continue;

		// Parse price (German format: comma as decimal separator)
		const price = parseFloat(priceStr.replace(",", "."));
		if (Number.isNaN(price)) continue;

		entries.push({
			timestamp,
			priceEurMwh: price,
		});
	}

	return entries;
}

/**
 * Parses German date format (DD.MM.YYYY HH:mm) from Berlin timezone to UTC.
 */
function parseGermanDateTime(dateStr: string): Date | null {
	// Expected format: "26.12.2025 00:00"
	const match = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})$/);
	if (!match) return null;

	const [, dayStr, monthStr, yearStr, hoursStr, minutesStr] = match;
	const day = Number.parseInt(dayStr, 10);
	const month = Number.parseInt(monthStr, 10) - 1; // JS months are 0-indexed
	const year = Number.parseInt(yearStr, 10);
	const hours = Number.parseInt(hoursStr, 10);
	const minutes = Number.parseInt(minutesStr, 10);

	// Create date in Berlin timezone, then convert to UTC
	// fromZonedTime interprets the input as if it's in the specified timezone
	const berlinDate = new Date(year, month, day, hours, minutes, 0, 0);
	return fromZonedTime(berlinDate, "Europe/Berlin");
}

/**
 * Returns the date range to fetch for spot prices.
 * On first run (no existing data): fetch last 7 days + today + tomorrow
 * On subsequent runs: fetch current day + next day (day-ahead)
 *
 * @param latestTimestamp The most recent spot price timestamp in DB, or null if empty
 * @returns Object with from and to dates for the fetch range
 */
export function getSmardFetchRange(latestTimestamp: Date | null): { from: Date; to: Date } {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 2); // End of tomorrow (exclusive range)

	if (!latestTimestamp) {
		// First run: backfill 7 days
		const sevenDaysAgo = new Date(today);
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		return { from: sevenDaysAgo, to: tomorrow };
	}

	// Subsequent runs: fetch from start of today to end of tomorrow
	// This ensures we get any updates and day-ahead prices
	return { from: today, to: tomorrow };
}
