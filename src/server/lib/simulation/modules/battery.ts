import type { EnergySeries, Simulation } from "../types";

export type EnergyAggregation = "raw" | "hour" | "weekday" | "day" | "week" | "calendar-week" | "month" | "year";

export interface BatterySimulationConfig {
	capacityKwh: number;
	maxPowerKw: number;
	initialStateOfCharge?: number | null;
	aggregation: EnergyAggregation;
}

const MS_PER_HOUR = 3600000;
const DEFAULT_RAW_INTERVAL_MS = 15000;

const DEFAULT_INITIAL_CHARGE_PERCENT = 0.5;

function getDefaultInitialCharge(config: BatterySimulationConfig): number {
	return config.capacityKwh * DEFAULT_INITIAL_CHARGE_PERCENT;
}

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

function applyBatteryInterval(
	consumption: number,
	inserted: number,
	currentCharge: number,
	maxEnergyThisInterval: number,
	capacity: number,
): {
	consumption: number;
	inserted: number;
	newCharge: number;
} {
	let charge = currentCharge;
	let remainingPower = maxEnergyThisInterval;

	let gridImport = consumption;
	let gridExport = inserted;

	if (remainingPower > 0 && gridExport > 0 && charge < capacity) {
		const chargeAmount = Math.min(gridExport, remainingPower, capacity - charge);

		if (chargeAmount > 0) {
			charge += chargeAmount;
			gridExport -= chargeAmount;
			remainingPower -= chargeAmount;
		}
	}

	if (remainingPower > 0 && gridImport > 0 && charge > 0) {
		const dischargeAmount = Math.min(gridImport, remainingPower, charge);

		if (dischargeAmount > 0) {
			charge -= dischargeAmount;
			gridImport -= dischargeAmount;
			remainingPower -= dischargeAmount;
		}
	}

	return {
		consumption: gridImport,
		inserted: gridExport,
		newCharge: charge,
	};
}

function simulateRawData(input: EnergySeries, config: BatterySimulationConfig): EnergySeries {
	const result: EnergySeries = [];
	let charge = config.initialStateOfCharge ?? getDefaultInitialCharge(config);

	let cumulativeImportReduction = 0;
	let cumulativeExportReduction = 0;

	for (let i = 0; i < input.length; i++) {
		const point = input[i];

		const intervalMs =
			i > 0 ? point.timestamp.getTime() - input[i - 1].timestamp.getTime() : DEFAULT_RAW_INTERVAL_MS;

		const intervalHours = intervalMs / MS_PER_HOUR;
		const maxEnergyThisInterval = config.maxPowerKw * intervalHours;

		const applied = applyBatteryInterval(
			point.consumption ?? 0,
			point.inserted ?? 0,
			charge,
			maxEnergyThisInterval,
			config.capacityKwh,
		);

		charge = applied.newCharge;

		const importReduction = (point.consumption ?? 0) - applied.consumption;
		const exportReduction = (point.inserted ?? 0) - applied.inserted;

		cumulativeImportReduction += importReduction;
		cumulativeExportReduction += exportReduction;

		result.push({
			...point,
			consumption: applied.consumption,
			inserted: applied.inserted,
			value: point.value - cumulativeImportReduction,
			valueOut: (point.valueOut ?? 0) - cumulativeExportReduction,
		});
	}

	return result;
}

function simulateHourlyAggregated(input: EnergySeries, config: BatterySimulationConfig): EnergySeries {
	const result: EnergySeries = [];
	let charge = config.initialStateOfCharge ?? getDefaultInitialCharge(config);

	let cumulativeImportReduction = 0;
	let cumulativeExportReduction = 0;

	const maxEnergyPerHour = config.maxPowerKw;

	for (const point of input) {
		const applied = applyBatteryInterval(
			point.consumption ?? 0,
			point.inserted ?? 0,
			charge,
			maxEnergyPerHour,
			config.capacityKwh,
		);

		charge = applied.newCharge;

		const importReduction = (point.consumption ?? 0) - applied.consumption;
		const exportReduction = (point.inserted ?? 0) - applied.inserted;

		cumulativeImportReduction += importReduction;
		cumulativeExportReduction += exportReduction;

		result.push({
			...point,
			consumption: applied.consumption,
			inserted: applied.inserted,
			value: point.value - cumulativeImportReduction,
			valueOut: (point.valueOut ?? 0) - cumulativeExportReduction,
		});
	}

	return result;
}

const HOURS_PER_DAY = 24;

function simulateDailyAggregated(input: EnergySeries, config: BatterySimulationConfig): EnergySeries {
	const result: EnergySeries = [];
	let charge = config.initialStateOfCharge ?? getDefaultInitialCharge(config);

	let cumulativeImportReduction = 0;
	let cumulativeExportReduction = 0;

	const maxEnergyPerDay = config.maxPowerKw * HOURS_PER_DAY;

	for (const point of input) {
		const applied = applyBatteryInterval(
			point.consumption ?? 0,
			point.inserted ?? 0,
			charge,
			maxEnergyPerDay,
			config.capacityKwh,
		);

		charge = applied.newCharge;

		const importReduction = (point.consumption ?? 0) - applied.consumption;
		const exportReduction = (point.inserted ?? 0) - applied.inserted;

		cumulativeImportReduction += importReduction;
		cumulativeExportReduction += exportReduction;

		result.push({
			...point,
			consumption: applied.consumption,
			inserted: applied.inserted,
			value: point.value - cumulativeImportReduction,
			valueOut: (point.valueOut ?? 0) - cumulativeExportReduction,
		});
	}

	return result;
}

function simulateWeeklyAggregated(input: EnergySeries, config: BatterySimulationConfig): EnergySeries {
	const result: EnergySeries = [];
	let charge = config.initialStateOfCharge ?? getDefaultInitialCharge(config);

	let cumulativeImportReduction = 0;
	let cumulativeExportReduction = 0;

	const maxEnergyPerWeek = config.maxPowerKw * HOURS_PER_DAY * 7;

	for (const point of input) {
		const applied = applyBatteryInterval(
			point.consumption ?? 0,
			point.inserted ?? 0,
			charge,
			maxEnergyPerWeek,
			config.capacityKwh,
		);

		charge = applied.newCharge;

		const importReduction = (point.consumption ?? 0) - applied.consumption;
		const exportReduction = (point.inserted ?? 0) - applied.inserted;

		cumulativeImportReduction += importReduction;
		cumulativeExportReduction += exportReduction;

		result.push({
			...point,
			consumption: applied.consumption,
			inserted: applied.inserted,
			value: point.value - cumulativeImportReduction,
			valueOut: (point.valueOut ?? 0) - cumulativeExportReduction,
		});
	}

	return result;
}

function simulateMonthlyAggregated(input: EnergySeries, config: BatterySimulationConfig): EnergySeries {
	const result: EnergySeries = [];
	let charge = config.initialStateOfCharge ?? getDefaultInitialCharge(config);

	let cumulativeImportReduction = 0;
	let cumulativeExportReduction = 0;

	for (const point of input) {
		const date = point.timestamp;
		const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
		const maxEnergyPerMonth = config.maxPowerKw * HOURS_PER_DAY * daysInMonth;

		const applied = applyBatteryInterval(
			point.consumption ?? 0,
			point.inserted ?? 0,
			charge,
			maxEnergyPerMonth,
			config.capacityKwh,
		);

		charge = applied.newCharge;

		const importReduction = (point.consumption ?? 0) - applied.consumption;
		const exportReduction = (point.inserted ?? 0) - applied.inserted;

		cumulativeImportReduction += importReduction;
		cumulativeExportReduction += exportReduction;

		result.push({
			...point,
			consumption: applied.consumption,
			inserted: applied.inserted,
			value: point.value - cumulativeImportReduction,
			valueOut: (point.valueOut ?? 0) - cumulativeExportReduction,
		});
	}

	return result;
}

function simulateYearlyAggregated(input: EnergySeries, config: BatterySimulationConfig): EnergySeries {
	const result: EnergySeries = [];
	let charge = config.initialStateOfCharge ?? getDefaultInitialCharge(config);

	let cumulativeImportReduction = 0;
	let cumulativeExportReduction = 0;

	for (const point of input) {
		const year = point.timestamp.getFullYear();
		const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
		const daysInYear = isLeapYear ? 366 : 365;
		const maxEnergyPerYear = config.maxPowerKw * HOURS_PER_DAY * daysInYear;

		const applied = applyBatteryInterval(
			point.consumption ?? 0,
			point.inserted ?? 0,
			charge,
			maxEnergyPerYear,
			config.capacityKwh,
		);

		charge = applied.newCharge;

		const importReduction = (point.consumption ?? 0) - applied.consumption;
		const exportReduction = (point.inserted ?? 0) - applied.inserted;

		cumulativeImportReduction += importReduction;
		cumulativeExportReduction += exportReduction;

		result.push({
			...point,
			consumption: applied.consumption,
			inserted: applied.inserted,
			value: point.value - cumulativeImportReduction,
			valueOut: (point.valueOut ?? 0) - cumulativeExportReduction,
		});
	}

	return result;
}

export function extractBatteryFinalState(input: EnergySeries, config: BatterySimulationConfig): number {
	if (input.length === 0) {
		return config.initialStateOfCharge ?? getDefaultInitialCharge(config);
	}

	let charge = config.initialStateOfCharge ?? getDefaultInitialCharge(config);
	const maxEnergyPerHour = config.maxPowerKw;

	for (const point of input) {
		const applied = applyBatteryInterval(
			point.consumption ?? 0,
			point.inserted ?? 0,
			charge,
			maxEnergyPerHour,
			config.capacityKwh,
		);
		charge = applied.newCharge;
	}

	return charge;
}
