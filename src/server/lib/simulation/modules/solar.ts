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

const ORIENTATION_EFFICIENCY: Record<SolarOrientationValue, number> = {
	[SolarOrientation.South]: 1.0,
	[SolarOrientation.East]: 0.8,
	[SolarOrientation.West]: 0.8,
	[SolarOrientation.EastWest]: 0.85,
};

const HOURLY_PRODUCTION_CURVE: Record<number, number> = {
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

function calculateDailyProduction(config: SolarSimulationConfig): number {
	const sunHours = config.sunHoursPerDay ?? DEFAULT_SUN_HOURS_PER_DAY;
	const orientationEfficiency = ORIENTATION_EFFICIENCY[config.orientation];
	const inverterLimit = config.inverterPower ?? config.peakPower;

	const theoreticalProduction = config.peakPower * sunHours * orientationEfficiency;
	const maxInverterProduction = inverterLimit * sunHours;

	return Math.min(theoreticalProduction, maxInverterProduction);
}

function getHourlyProductionFraction(hour: number): number {
	return HOURLY_PRODUCTION_CURVE[hour] ?? 0;
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

		const dailyProduction = calculateDailyProduction(config);

		switch (config.aggregation) {
			case "raw":
				return simulateRawData(input, dailyProduction);

			case "hour":
				return simulateHourlyAggregated(input, dailyProduction);

			case "day":
			case "weekday":
				return simulateDailyAggregated(input, dailyProduction);

			case "week":
			case "calendar-week":
				return simulateWeeklyAggregated(input, dailyProduction);

			case "month":
				return simulateMonthlyAggregated(input, dailyProduction);

			case "year":
				return simulateYearlyAggregated(input, dailyProduction);

			default:
				return simulateRawData(input, dailyProduction);
		}
	};
}

function simulateRawData(input: EnergySeries, dailyProduction: number): EnergySeries {
	const result: EnergySeries = [];

	let currentDay: string | null = null;
	let dayPoints: { index: number; hour: number; fraction: number }[] = [];
	let cumulativeValueReduction = 0;
	let cumulativeValueOutIncrease = 0;

	for (let i = 0; i < input.length; i++) {
		const point = input[i];
		const day = point.timestamp.toISOString().split("T")[0];
		const hour = point.timestamp.getHours();

		if (currentDay !== day) {
			if (dayPoints.length > 0) {
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
			dayPoints = [];
		}

		const fraction = getHourlyProductionFraction(hour);
		dayPoints.push({ index: i, hour, fraction });
	}

	if (dayPoints.length > 0) {
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

function simulateHourlyAggregated(input: EnergySeries, dailyProduction: number): EnergySeries {
	const result: EnergySeries = [];
	let valueReduction = 0;
	let valueOutIncrease = 0;

	for (const point of input) {
		const hour = point.timestamp.getHours();
		const fraction = getHourlyProductionFraction(hour);
		const production = dailyProduction * fraction;

		const applied = applySolarProduction(point, production, valueReduction, valueOutIncrease);
		result.push(applied.point);
		valueReduction = applied.valueReduction;
		valueOutIncrease = applied.valueOutIncrease;
	}

	return result;
}

function simulateDailyAggregated(input: EnergySeries, dailyProduction: number): EnergySeries {
	const result: EnergySeries = [];
	let valueReduction = 0;
	let valueOutIncrease = 0;

	for (const point of input) {
		const applied = applySolarProduction(point, dailyProduction, valueReduction, valueOutIncrease);
		result.push(applied.point);
		valueReduction = applied.valueReduction;
		valueOutIncrease = applied.valueOutIncrease;
	}

	return result;
}

function simulateWeeklyAggregated(input: EnergySeries, dailyProduction: number): EnergySeries {
	const weeklyProduction = dailyProduction * 7;
	const result: EnergySeries = [];
	let valueReduction = 0;
	let valueOutIncrease = 0;

	for (const point of input) {
		const applied = applySolarProduction(point, weeklyProduction, valueReduction, valueOutIncrease);
		result.push(applied.point);
		valueReduction = applied.valueReduction;
		valueOutIncrease = applied.valueOutIncrease;
	}

	return result;
}

function simulateMonthlyAggregated(input: EnergySeries, dailyProduction: number): EnergySeries {
	const monthlyProduction = dailyProduction * 30;
	const result: EnergySeries = [];
	let valueReduction = 0;
	let valueOutIncrease = 0;

	for (const point of input) {
		const applied = applySolarProduction(point, monthlyProduction, valueReduction, valueOutIncrease);
		result.push(applied.point);
		valueReduction = applied.valueReduction;
		valueOutIncrease = applied.valueOutIncrease;
	}

	return result;
}

function simulateYearlyAggregated(input: EnergySeries, dailyProduction: number): EnergySeries {
	const yearlyProduction = dailyProduction * 365;
	const result: EnergySeries = [];
	let valueReduction = 0;
	let valueOutIncrease = 0;

	for (const point of input) {
		const applied = applySolarProduction(point, yearlyProduction, valueReduction, valueOutIncrease);
		result.push(applied.point);
		valueReduction = applied.valueReduction;
		valueOutIncrease = applied.valueOutIncrease;
	}

	return result;
}
