import type { EnergyPoint, EnergySeries, Simulation } from "../types";

export type EnergyAggregation = "raw" | "hour" | "weekday" | "day" | "week" | "calendar-week" | "month" | "year";

export interface BatterySimulationConfig {
	capacityKwh: number;
	maxPowerKw: number;
	initialStateOfCharge?: number | null;
	aggregation: EnergyAggregation;
}

const MS_PER_HOUR = 3600000;
const DEFAULT_RAW_INTERVAL_MS = 15000;

export function createBatterySimulation(config: BatterySimulationConfig): Simulation {
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

function applyBattery(
	point: EnergyPoint,
	currentCharge: number,
	maxChargeThisInterval: number,
	capacity: number,
	cumulativeValueReduction: number,
	cumulativeValueOutReduction: number,
): {
	point: EnergyPoint;
	newCharge: number;
	valueReduction: number;
	valueOutReduction: number;
} {
	let charge = currentCharge;
	let valueReduction = cumulativeValueReduction;
	let valueOutReduction = cumulativeValueOutReduction;

	const consumption = point.consumption;
	const valueOut = point.valueOut ?? 0;

	let newConsumption = consumption;
	let newValueOut = valueOut;

	if (valueOut > 0 && charge < capacity) {
		const availableToStore = Math.min(
			valueOut,
			maxChargeThisInterval,
			capacity - charge,
		);

		charge += availableToStore;
		valueOutReduction += availableToStore;
		newValueOut = valueOut - availableToStore;
	}

	if (newConsumption > 0 && charge > 0) {
		const availableToDischarge = Math.min(
			newConsumption,
			maxChargeThisInterval,
			charge,
		);

		charge -= availableToDischarge;
		valueReduction += availableToDischarge;
		newConsumption = newConsumption - availableToDischarge;
	}

	return {
		point: {
			...point,
			consumption: newConsumption,
			value: point.value - valueReduction,
			valueOut: newValueOut - cumulativeValueOutReduction,
		},
		newCharge: charge,
		valueReduction,
		valueOutReduction,
	};
}

function simulateRawData(input: EnergySeries, config: BatterySimulationConfig): EnergySeries {
	const result: EnergySeries = [];
	let charge = config.initialStateOfCharge ?? 0;
	let valueReduction = 0;
	let valueOutReduction = 0;

	for (let i = 0; i < input.length; i++) {
		const point = input[i];

		let intervalHours: number;
		if (i > 0) {
			intervalHours = (point.timestamp.getTime() - input[i - 1].timestamp.getTime()) / MS_PER_HOUR;
		} else {
			intervalHours = DEFAULT_RAW_INTERVAL_MS / MS_PER_HOUR;
		}

		const maxChargeThisInterval = config.maxPowerKw * intervalHours;

		const applied = applyBattery(
			point,
			charge,
			maxChargeThisInterval,
			config.capacityKwh,
			valueReduction,
			valueOutReduction,
		);

		result.push(applied.point);
		charge = applied.newCharge;
		valueReduction = applied.valueReduction;
		valueOutReduction = applied.valueOutReduction;
	}

	return result;
}

function simulateHourlyAggregated(input: EnergySeries, config: BatterySimulationConfig): EnergySeries {
	const result: EnergySeries = [];
	let charge = config.initialStateOfCharge ?? 0;
	let valueReduction = 0;
	let valueOutReduction = 0;

	const maxChargePerHour = config.maxPowerKw;

	for (const point of input) {
		const applied = applyBattery(
			point,
			charge,
			maxChargePerHour,
			config.capacityKwh,
			valueReduction,
			valueOutReduction,
		);

		result.push(applied.point);
		charge = applied.newCharge;
		valueReduction = applied.valueReduction;
		valueOutReduction = applied.valueOutReduction;
	}

	return result;
}

function simulateDailyAggregated(input: EnergySeries, config: BatterySimulationConfig): EnergySeries {
	const result: EnergySeries = [];
	let charge = config.initialStateOfCharge ?? 0;
	let valueReduction = 0;
	let valueOutReduction = 0;

	const maxChargePerDay = Math.min(config.maxPowerKw * 24, config.capacityKwh);

	for (const point of input) {
		const applied = applyBattery(
			point,
			charge,
			maxChargePerDay,
			config.capacityKwh,
			valueReduction,
			valueOutReduction,
		);

		result.push(applied.point);
		charge = applied.newCharge;
		valueReduction = applied.valueReduction;
		valueOutReduction = applied.valueOutReduction;
	}

	return result;
}

function simulateWeeklyAggregated(input: EnergySeries, config: BatterySimulationConfig): EnergySeries {
	const result: EnergySeries = [];
	let charge = config.initialStateOfCharge ?? 0;
	let valueReduction = 0;
	let valueOutReduction = 0;

	const maxChargePerWeek = Math.min(config.maxPowerKw * 24 * 7, config.capacityKwh * 7);

	for (const point of input) {
		const applied = applyBattery(
			point,
			charge,
			maxChargePerWeek,
			config.capacityKwh,
			valueReduction,
			valueOutReduction,
		);

		result.push(applied.point);
		charge = applied.newCharge;
		valueReduction = applied.valueReduction;
		valueOutReduction = applied.valueOutReduction;
	}

	return result;
}

function simulateMonthlyAggregated(input: EnergySeries, config: BatterySimulationConfig): EnergySeries {
	const result: EnergySeries = [];
	let charge = config.initialStateOfCharge ?? 0;
	let valueReduction = 0;
	let valueOutReduction = 0;

	const maxChargePerMonth = Math.min(config.maxPowerKw * 24 * 30, config.capacityKwh * 30);

	for (const point of input) {
		const applied = applyBattery(
			point,
			charge,
			maxChargePerMonth,
			config.capacityKwh,
			valueReduction,
			valueOutReduction,
		);

		result.push(applied.point);
		charge = applied.newCharge;
		valueReduction = applied.valueReduction;
		valueOutReduction = applied.valueOutReduction;
	}

	return result;
}

function simulateYearlyAggregated(input: EnergySeries, config: BatterySimulationConfig): EnergySeries {
	const result: EnergySeries = [];
	let charge = config.initialStateOfCharge ?? 0;
	let valueReduction = 0;
	let valueOutReduction = 0;

	const maxChargePerYear = Math.min(config.maxPowerKw * 24 * 365, config.capacityKwh * 365);

	for (const point of input) {
		const applied = applyBattery(
			point,
			charge,
			maxChargePerYear,
			config.capacityKwh,
			valueReduction,
			valueOutReduction,
		);

		result.push(applied.point);
		charge = applied.newCharge;
		valueReduction = applied.valueReduction;
		valueOutReduction = applied.valueOutReduction;
	}

	return result;
}
