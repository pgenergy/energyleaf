import type { SolarOrientationValue } from "@/lib/enums";
import { SolarOrientation } from "@/lib/enums";
import type { EnergyPoint, EnergySeries, Simulation } from "../types";

export type EnergyAggregation = "raw" | "hour" | "weekday" | "day" | "week" | "calendar-week" | "month" | "year";

export interface SolarSimulationConfig {
	peakPower: number;
	orientation: SolarOrientationValue;
	inverterPower?: number | null;
	sunHoursPerDay?: number | null;
	aggregation: EnergyAggregation;
}

const DEFAULT_SUN_HOURS_PER_DAY = 4.5;

const MONTHLY_SUN_HOURS: Record<number, number> = {
	0: 1.5,
	1: 2.5,
	2: 4.0,
	3: 5.5,
	4: 7.0,
	5: 8.0,
	6: 8.0,
	7: 7.0,
	8: 5.5,
	9: 3.5,
	10: 2.0,
	11: 1.5,
};

const ORIENTATION_EFFICIENCY: Record<SolarOrientationValue, number> = {
	[SolarOrientation.South]: 1.0,
	[SolarOrientation.East]: 0.8,
	[SolarOrientation.West]: 0.8,
	[SolarOrientation.EastWest]: 0.85,
};

// Summer curve (May-Aug): ~5am-8pm
const SUMMER_PRODUCTION_CURVE: Record<number, number> = {
	0: 0,
	1: 0,
	2: 0,
	3: 0,
	4: 0,
	5: 0.02,
	6: 0.05,
	7: 0.08,
	8: 0.1,
	9: 0.12,
	10: 0.13,
	11: 0.14,
	12: 0.14,
	13: 0.13,
	14: 0.12,
	15: 0.1,
	16: 0.08,
	17: 0.05,
	18: 0.02,
	19: 0,
	20: 0,
	21: 0,
	22: 0,
	23: 0,
};

// Winter curve (Nov-Feb): ~8am-4pm
const WINTER_PRODUCTION_CURVE: Record<number, number> = {
	0: 0,
	1: 0,
	2: 0,
	3: 0,
	4: 0,
	5: 0,
	6: 0,
	7: 0,
	8: 0.08,
	9: 0.14,
	10: 0.18,
	11: 0.2,
	12: 0.2,
	13: 0.18,
	14: 0.14,
	15: 0.08,
	16: 0,
	17: 0,
	18: 0,
	19: 0,
	20: 0,
	21: 0,
	22: 0,
	23: 0,
};

// Transition curve (Mar-Apr, Sep-Oct): ~6am-6pm
const TRANSITION_PRODUCTION_CURVE: Record<number, number> = {
	0: 0,
	1: 0,
	2: 0,
	3: 0,
	4: 0,
	5: 0,
	6: 0.03,
	7: 0.06,
	8: 0.1,
	9: 0.13,
	10: 0.15,
	11: 0.16,
	12: 0.16,
	13: 0.15,
	14: 0.13,
	15: 0.1,
	16: 0.06,
	17: 0.03,
	18: 0,
	19: 0,
	20: 0,
	21: 0,
	22: 0,
	23: 0,
};

type SeasonType = "summer" | "winter" | "transition";

function getSeason(month: number): SeasonType {
	if (month >= 4 && month <= 7) return "summer";
	if (month === 10 || month === 11 || month === 0 || month === 1) return "winter";
	return "transition";
}

function getHourlyProductionCurve(month: number): Record<number, number> {
	const season = getSeason(month);
	switch (season) {
		case "summer":
			return SUMMER_PRODUCTION_CURVE;
		case "winter":
			return WINTER_PRODUCTION_CURVE;
		default:
			return TRANSITION_PRODUCTION_CURVE;
	}
}

function getSeasonalSunHours(timestamp: Date, config: SolarSimulationConfig): number {
	const userAverage = config.sunHoursPerDay ?? DEFAULT_SUN_HOURS_PER_DAY;
	const month = timestamp.getMonth();
	const baseSunHours = MONTHLY_SUN_HOURS[month] ?? DEFAULT_SUN_HOURS_PER_DAY;
	const scaleFactor = userAverage / DEFAULT_SUN_HOURS_PER_DAY;
	return baseSunHours * scaleFactor;
}

function getMonthSunHours(month: number, config: SolarSimulationConfig): number {
	const userAverage = config.sunHoursPerDay ?? DEFAULT_SUN_HOURS_PER_DAY;
	const baseSunHours = MONTHLY_SUN_HOURS[month] ?? DEFAULT_SUN_HOURS_PER_DAY;
	const scaleFactor = userAverage / DEFAULT_SUN_HOURS_PER_DAY;
	return baseSunHours * scaleFactor;
}

function calculateDailyProduction(config: SolarSimulationConfig, sunHours: number): number {
	const orientationEfficiency = ORIENTATION_EFFICIENCY[config.orientation];
	const inverterLimit = config.inverterPower ?? config.peakPower;

	const theoreticalProduction = config.peakPower * sunHours * orientationEfficiency;
	const maxInverterProduction = inverterLimit * sunHours;

	return Math.min(theoreticalProduction, maxInverterProduction);
}

function getHourlyProductionFraction(hour: number, month: number): number {
	const curve = getHourlyProductionCurve(month);
	return curve[hour] ?? 0;
}

function applySolarProduction(
	point: EnergyPoint,
	production: number,
	cumulativeValueReduction: number,
	cumulativeValueOutIncrease: number,
): { point: EnergyPoint; valueReduction: number; valueOutIncrease: number } {
	const consumption = point.consumption;

	const selfConsumption = Math.min(production, consumption);

	const excess = Math.max(0, production - consumption);

	const newValueReduction = cumulativeValueReduction + selfConsumption;
	const newValueOutIncrease = cumulativeValueOutIncrease + excess;

	return {
		point: {
			...point,
			consumption: consumption - selfConsumption,
			inserted: (point.inserted ?? 0) + excess,
			value: point.value - newValueReduction,
			valueOut: (point.valueOut ?? 0) + newValueOutIncrease,
		},
		valueReduction: newValueReduction,
		valueOutIncrease: newValueOutIncrease,
	};
}

export function createSolarSimulation(config: SolarSimulationConfig): Simulation {
	return async (input: EnergySeries): Promise<EnergySeries> => {
		if (input.length === 0) {
			return input;
		}

		switch (config.aggregation) {
			case "raw":
				return simulateRawData(input, config);

			case "hour":
				return simulateHourlyAggregated(input, config);

			case "day":
			case "weekday":
				return simulateDailyAggregated(input, config);

			case "week":
			case "calendar-week":
				return simulateWeeklyAggregated(input, config);

			case "month":
				return simulateMonthlyAggregated(input, config);

			case "year":
				return simulateYearlyAggregated(input, config);

			default:
				return simulateRawData(input, config);
		}
	};
}

function simulateRawData(input: EnergySeries, config: SolarSimulationConfig): EnergySeries {
	const result: EnergySeries = [];

	let currentDay: string | null = null;
	let currentDayTimestamp: Date | null = null;
	let dayPoints: { index: number; hour: number; fraction: number }[] = [];
	let cumulativeValueReduction = 0;
	let cumulativeValueOutIncrease = 0;

	for (let i = 0; i < input.length; i++) {
		const point = input[i];
		const day = point.timestamp.toISOString().split("T")[0];
		const hour = point.timestamp.getHours();

		if (currentDay !== day) {
			if (dayPoints.length > 0 && currentDayTimestamp) {
				const sunHours = getSeasonalSunHours(currentDayTimestamp, config);
				const dailyProduction = calculateDailyProduction(config, sunHours);
				const cumulative = distributeDailyProduction(
					result,
					input,
					dayPoints,
					dailyProduction,
					cumulativeValueReduction,
					cumulativeValueOutIncrease,
				);
				cumulativeValueReduction = cumulative.valueReduction;
				cumulativeValueOutIncrease = cumulative.valueOutIncrease;
			}
			currentDay = day;
			currentDayTimestamp = point.timestamp;
			dayPoints = [];
		}

		const month = point.timestamp.getMonth();
		const fraction = getHourlyProductionFraction(hour, month);
		dayPoints.push({ index: i, hour, fraction });
	}

	if (dayPoints.length > 0 && currentDayTimestamp) {
		const sunHours = getSeasonalSunHours(currentDayTimestamp, config);
		const dailyProduction = calculateDailyProduction(config, sunHours);
		distributeDailyProduction(
			result,
			input,
			dayPoints,
			dailyProduction,
			cumulativeValueReduction,
			cumulativeValueOutIncrease,
		);
	}

	return result;
}

function distributeDailyProduction(
	result: EnergySeries,
	input: EnergySeries,
	dayPoints: { index: number; hour: number; fraction: number }[],
	dailyProduction: number,
	initialValueReduction: number,
	initialValueOutIncrease: number,
): { valueReduction: number; valueOutIncrease: number } {
	const totalFraction = dayPoints.reduce((sum, p) => sum + p.fraction, 0);

	let valueReduction = initialValueReduction;
	let valueOutIncrease = initialValueOutIncrease;

	for (const { index, fraction } of dayPoints) {
		const point = input[index];
		const production = totalFraction > 0 ? (fraction / totalFraction) * dailyProduction : 0;

		const applied = applySolarProduction(point, production, valueReduction, valueOutIncrease);
		result.push(applied.point);
		valueReduction = applied.valueReduction;
		valueOutIncrease = applied.valueOutIncrease;
	}

	return { valueReduction, valueOutIncrease };
}

function simulateHourlyAggregated(input: EnergySeries, config: SolarSimulationConfig): EnergySeries {
	const result: EnergySeries = [];
	let valueReduction = 0;
	let valueOutIncrease = 0;

	for (const point of input) {
		const sunHours = getSeasonalSunHours(point.timestamp, config);
		const dailyProduction = calculateDailyProduction(config, sunHours);
		const hour = point.timestamp.getHours();
		const month = point.timestamp.getMonth();
		const fraction = getHourlyProductionFraction(hour, month);
		const production = dailyProduction * fraction;

		const applied = applySolarProduction(point, production, valueReduction, valueOutIncrease);
		result.push(applied.point);
		valueReduction = applied.valueReduction;
		valueOutIncrease = applied.valueOutIncrease;
	}

	return result;
}

function simulateDailyAggregated(input: EnergySeries, config: SolarSimulationConfig): EnergySeries {
	const result: EnergySeries = [];
	let valueReduction = 0;
	let valueOutIncrease = 0;

	for (const point of input) {
		const sunHours = getSeasonalSunHours(point.timestamp, config);
		const dailyProduction = calculateDailyProduction(config, sunHours);

		const applied = applySolarProduction(point, dailyProduction, valueReduction, valueOutIncrease);
		result.push(applied.point);
		valueReduction = applied.valueReduction;
		valueOutIncrease = applied.valueOutIncrease;
	}

	return result;
}

function simulateWeeklyAggregated(input: EnergySeries, config: SolarSimulationConfig): EnergySeries {
	const result: EnergySeries = [];
	let valueReduction = 0;
	let valueOutIncrease = 0;

	for (const point of input) {
		const sunHours = getSeasonalSunHours(point.timestamp, config);
		const dailyProduction = calculateDailyProduction(config, sunHours);
		const weeklyProduction = dailyProduction * 7;

		const applied = applySolarProduction(point, weeklyProduction, valueReduction, valueOutIncrease);
		result.push(applied.point);
		valueReduction = applied.valueReduction;
		valueOutIncrease = applied.valueOutIncrease;
	}

	return result;
}

function simulateMonthlyAggregated(input: EnergySeries, config: SolarSimulationConfig): EnergySeries {
	const result: EnergySeries = [];
	let valueReduction = 0;
	let valueOutIncrease = 0;

	for (const point of input) {
		const date = point.timestamp;
		const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
		const sunHours = getSeasonalSunHours(point.timestamp, config);
		const dailyProduction = calculateDailyProduction(config, sunHours);
		const monthlyProduction = dailyProduction * daysInMonth;

		const applied = applySolarProduction(point, monthlyProduction, valueReduction, valueOutIncrease);
		result.push(applied.point);
		valueReduction = applied.valueReduction;
		valueOutIncrease = applied.valueOutIncrease;
	}

	return result;
}

function simulateYearlyAggregated(input: EnergySeries, config: SolarSimulationConfig): EnergySeries {
	const result: EnergySeries = [];
	let valueReduction = 0;
	let valueOutIncrease = 0;

	for (const point of input) {
		const year = point.timestamp.getFullYear();
		const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
		const daysPerMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

		let yearlyProduction = 0;
		for (let month = 0; month < 12; month++) {
			const sunHours = getMonthSunHours(month, config);
			const dailyProduction = calculateDailyProduction(config, sunHours);
			yearlyProduction += dailyProduction * daysPerMonth[month];
		}

		const applied = applySolarProduction(point, yearlyProduction, valueReduction, valueOutIncrease);
		result.push(applied.point);
		valueReduction = applied.valueReduction;
		valueOutIncrease = applied.valueOutIncrease;
	}

	return result;
}
