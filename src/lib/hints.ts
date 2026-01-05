import type { HintStage } from "@/server/db/tables/hints";

/**
 * Hint type identifiers
 */
export const HintType = {
	// Simple - Quantifying consumption and cost
	SIMPLE_TOTAL_CONSUMPTION: "simple_total_consumption",
	SIMPLE_CONSUMPTION_COST: "simple_consumption_cost",
	SIMPLE_MONTH_PREDICTION: "simple_month_prediction",
	// Simple - Time context
	SIMPLE_LOWEST_HOUR: "simple_lowest_hour",
	SIMPLE_HIGHEST_HOUR: "simple_highest_hour",
	SIMPLE_PERCENT_CHANGE: "simple_percent_change",
	SIMPLE_KWH_CHANGE: "simple_kwh_change",
	// Intermediate - Peaks
	INTERMEDIATE_PEAK_SPIKE: "intermediate_peak_spike",
	INTERMEDIATE_PEAK_VS_AVG: "intermediate_peak_vs_avg",
	INTERMEDIATE_PEAK_VS_LOWEST: "intermediate_peak_vs_lowest",
	// Intermediate - Averaging
	INTERMEDIATE_WEEK_COMPARISON: "intermediate_week_comparison",
	INTERMEDIATE_WEEKEND_VS_WEEKDAY: "intermediate_weekend_vs_weekday",
	// Expert - Consumption behavior
	EXPERT_HIGH_USE_PERIOD: "expert_high_use_period",
	EXPERT_PERIOD_PERCENTAGE: "expert_period_percentage",
	EXPERT_PERIOD_VS_AVG: "expert_period_vs_avg",
	// Expert - Device usage
	EXPERT_DEVICE_USAGE: "expert_device_usage",
} as const;

export type HintTypeValue = (typeof HintType)[keyof typeof HintType];

/**
 * Hints available per stage (each stage only has its own hints, fallback handled separately)
 */
export const STAGE_HINTS: Record<HintStage, HintTypeValue[]> = {
	simple: [
		HintType.SIMPLE_TOTAL_CONSUMPTION,
		HintType.SIMPLE_CONSUMPTION_COST,
		HintType.SIMPLE_MONTH_PREDICTION,
		HintType.SIMPLE_LOWEST_HOUR,
		HintType.SIMPLE_HIGHEST_HOUR,
		HintType.SIMPLE_PERCENT_CHANGE,
		HintType.SIMPLE_KWH_CHANGE,
	],
	intermediate: [
		HintType.INTERMEDIATE_PEAK_SPIKE,
		HintType.INTERMEDIATE_PEAK_VS_AVG,
		HintType.INTERMEDIATE_PEAK_VS_LOWEST,
		HintType.INTERMEDIATE_WEEK_COMPARISON,
		HintType.INTERMEDIATE_WEEKEND_VS_WEEKDAY,
	],
	expert: [
		HintType.EXPERT_HIGH_USE_PERIOD,
		HintType.EXPERT_PERIOD_PERCENTAGE,
		HintType.EXPERT_PERIOD_VS_AVG,
		HintType.EXPERT_DEVICE_USAGE,
	],
};

/**
 * Fallback chain: expert → intermediate → simple
 */
export const STAGE_FALLBACK: Record<HintStage, HintStage | null> = {
	simple: null,
	intermediate: "simple",
	expert: "intermediate",
};

/**
 * Stage order for progression
 */
export const STAGE_ORDER: HintStage[] = ["simple", "intermediate", "expert"];

/**
 * Number of days with hints seen before advancing to next stage
 */
export const HINTS_DAYS_TO_ADVANCE = 3;

/**
 * Minimum days of energy data required to generate hints
 */
export const MIN_DATA_DAYS = 3;

/**
 * Link targets per hint type
 */
export const HINT_LINK_TARGETS: Record<HintTypeValue, string> = {
	[HintType.SIMPLE_TOTAL_CONSUMPTION]: "/energy",
	[HintType.SIMPLE_CONSUMPTION_COST]: "/cost",
	[HintType.SIMPLE_MONTH_PREDICTION]: "/cost",
	[HintType.SIMPLE_LOWEST_HOUR]: "/energy",
	[HintType.SIMPLE_HIGHEST_HOUR]: "/energy",
	[HintType.SIMPLE_PERCENT_CHANGE]: "/energy",
	[HintType.SIMPLE_KWH_CHANGE]: "/energy",
	[HintType.INTERMEDIATE_PEAK_SPIKE]: "/peaks",
	[HintType.INTERMEDIATE_PEAK_VS_AVG]: "/peaks",
	[HintType.INTERMEDIATE_PEAK_VS_LOWEST]: "/peaks",
	[HintType.INTERMEDIATE_WEEK_COMPARISON]: "/energy",
	[HintType.INTERMEDIATE_WEEKEND_VS_WEEKDAY]: "/energy",
	[HintType.EXPERT_HIGH_USE_PERIOD]: "/energy",
	[HintType.EXPERT_PERIOD_PERCENTAGE]: "/energy",
	[HintType.EXPERT_PERIOD_VS_AVG]: "/energy",
	[HintType.EXPERT_DEVICE_USAGE]: "/devices",
};

/**
 * German text templates for each hint type
 * Use placeholders like {consumption}, {cost}, {hour}, {percent}, {direction}, etc.
 */
export const HINT_TEMPLATES: Record<HintTypeValue, string[]> = {
	[HintType.SIMPLE_TOTAL_CONSUMPTION]: [
		"Dein gesamter Stromverbrauch gestern betrug {consumption} kWh.",
		"Gestern hast du insgesamt {consumption} kWh verbraucht.",
		"Dein Stromverbrauch lag gestern bei {consumption} kWh.",
	],
	[HintType.SIMPLE_CONSUMPTION_COST]: [
		"Gestern hast du {consumption} kWh verbraucht, was Kosten von {cost} € verursacht hat.",
		"Dein gestriger Verbrauch von {consumption} kWh entsprach Kosten von {cost} €.",
		"Für {consumption} kWh Stromverbrauch gestern sind {cost} € angefallen.",
	],
	[HintType.SIMPLE_MONTH_PREDICTION]: [
		"Bei diesem Verbrauch wird dich der laufende Monat etwa {cost} € kosten.",
		"Hält dieser Trend an, liegen deine Stromkosten diesen Monat bei rund {cost} €.",
		"Mit dem aktuellen Verbrauchsverhalten kostet dich dieser Monat voraussichtlich {cost} €.",
	],
	[HintType.SIMPLE_LOWEST_HOUR]: [
		"Dein niedrigster Verbrauch war gestern um {hour} Uhr.",
		"Um {hour} Uhr lag dein Verbrauch gestern am niedrigsten.",
	],
	[HintType.SIMPLE_HIGHEST_HOUR]: [
		"Der höchste Stromverbrauch wurde gestern um {hour} Uhr gemessen.",
		"Um {hour} Uhr lag dein Verbrauch gestern am höchsten.",
	],
	[HintType.SIMPLE_PERCENT_CHANGE]: [
		"Du hast gestern {percent} % {direction} Strom verbraucht als am Vortag.",
		"Im Vergleich zum Vortag lag dein Verbrauch gestern um {percent} % {directionAlt}.",
	],
	[HintType.SIMPLE_KWH_CHANGE]: [
		"Du hast gestern {kwh} kWh {direction} verbraucht als am Tag zuvor.",
		"Gegenüber dem Vortag ist dein Verbrauch gestern um {kwh} kWh {directionAlt}.",
	],
	[HintType.INTERMEDIATE_PEAK_SPIKE]: [
		"Um {hour} Uhr ist dein Stromverbrauch gestern deutlich angestiegen.",
		"Ein starker Verbrauchssprung wurde gestern um {hour} Uhr festgestellt.",
		"Dein Stromverbrauch hatte gestern um {hour} Uhr eine Spitze.",
	],
	[HintType.INTERMEDIATE_PEAK_VS_AVG]: [
		"Die Verbrauchsspitze um {hour} Uhr lag {percent} % über dem Tagesdurchschnitt.",
		"Um {hour} Uhr war dein Verbrauch {percent} % höher als der durchschnittliche Tageswert.",
	],
	[HintType.INTERMEDIATE_PEAK_VS_LOWEST]: [
		"Die Spitze um {peakHour} Uhr lag {percent} % über dem niedrigsten Verbrauch um {lowestHour} Uhr.",
		"Um {peakHour} Uhr war dein Verbrauch {percent} % höher als zur verbrauchsärmsten Stunde um {lowestHour} Uhr.",
	],
	[HintType.INTERMEDIATE_WEEK_COMPARISON]: [
		"Insgesamt hast du letzte Woche {percent} % {direction} Strom verbraucht als in der Woche davor.",
		"Dein gesamter Wochenverbrauch lag letzte Woche um {percent} % {directionPrep} dem der Vorwoche.",
	],
	[HintType.INTERMEDIATE_WEEKEND_VS_WEEKDAY]: [
		"Am Wochenende ist dein Stromverbrauch im Durchschnitt {percent} % {direction} als an Werktagen.",
		"Dein durchschnittlicher Verbrauch unterscheidet sich am Wochenende um {percent} % von den Werktagen.",
	],
	[HintType.EXPERT_HIGH_USE_PERIOD]: [
		"Zwischen {startHour} und {endHour} Uhr hast du gestern {consumption} kWh verbraucht.",
		"Im Zeitraum von {startHour} bis {endHour} Uhr lag dein Verbrauch gestern bei {consumption} kWh.",
	],
	[HintType.EXPERT_PERIOD_PERCENTAGE]: [
		"Zwischen {startHour} und {endHour} Uhr entfielen gestern {percent} % deines Tagesverbrauchs.",
		"Der Zeitraum von {startHour} bis {endHour} Uhr machte gestern {percent} % des gesamten Tagesverbrauchs aus.",
	],
	[HintType.EXPERT_PERIOD_VS_AVG]: [
		"Die durchschnittliche Leistung zwischen {startHour} und {endHour} Uhr lag gestern {percent} % über dem Tagesdurchschnitt.",
		"Im Zeitraum {startHour} bis {endHour} Uhr war die Leistungsaufnahme gestern {percent} % höher als im Tagesmittel.",
	],
	[HintType.EXPERT_DEVICE_USAGE]: [
		"Das Gerät {device} verbrauchte gestern {consumption} kWh, was {percent} % deines Tagesverbrauchs entspricht.",
		"{device} hat gestern {consumption} kWh Strom genutzt und damit {percent} % des Gesamtverbrauchs verursacht.",
	],
};

/**
 * Data structure for hint generation
 */
export interface HintData {
	consumption?: number;
	cost?: number;
	hour?: number;
	percent?: number;
	kwh?: number;
	direction?: string;
	directionAlt?: string;
	directionPrep?: string;
	peakHour?: number;
	lowestHour?: number;
	startHour?: number;
	endHour?: number;
	device?: string;
}

/**
 * Format a hint template with data values
 */
export function formatHintText(hintType: HintTypeValue, data: HintData, templateIndex?: number): string {
	const templates = HINT_TEMPLATES[hintType];
	const idx = templateIndex ?? Math.floor(Math.random() * templates.length);
	let text = templates[idx % templates.length];

	// Replace all placeholders
	for (const [key, value] of Object.entries(data)) {
		if (value !== undefined) {
			const formatted = typeof value === "number" ? value.toFixed(2).replace(/\.00$/, "") : String(value);
			text = text.replace(new RegExp(`\\{${key}\\}`, "g"), formatted);
		}
	}

	return text;
}

/**
 * Get the next stage in progression
 */
export function getNextStage(current: HintStage): HintStage | null {
	const idx = STAGE_ORDER.indexOf(current);
	if (idx === -1 || idx >= STAGE_ORDER.length - 1) {
		return null;
	}
	return STAGE_ORDER[idx + 1];
}

/**
 * Get all available hints for a stage including fallback stages
 */
export function getAvailableHintsForStage(stage: HintStage): HintTypeValue[] {
	const hints: HintTypeValue[] = [...STAGE_HINTS[stage]];

	// Add fallback stage hints
	let fallbackStage = STAGE_FALLBACK[stage];
	while (fallbackStage) {
		hints.push(...STAGE_HINTS[fallbackStage]);
		fallbackStage = STAGE_FALLBACK[fallbackStage];
	}

	return hints;
}
