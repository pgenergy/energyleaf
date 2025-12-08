import type { HeatPumpSourceValue } from "@/lib/enums";
import { HeatPumpSource } from "@/lib/enums";
import type { HeatingTimeSlot, HeatingWeekdaySchedules } from "@/server/db/tables/simulation";
import type { EnergySeries, Simulation } from "../types";

export type EnergyAggregation = "raw" | "hour" | "weekday" | "day" | "week" | "calendar-week" | "month" | "year";

export interface HeatPumpSimulationConfig {
	source: HeatPumpSourceValue;
	powerKw: number;
	bufferLiter?: number | null;
	defaultSchedule: HeatingTimeSlot[];
	weekdaySchedules: HeatingWeekdaySchedules;
	aggregation: EnergyAggregation;
}

const MS_PER_HOUR = 3600000;
const DEFAULT_RAW_INTERVAL_MS = 15000;

const COP_BY_SOURCE: Record<HeatPumpSourceValue, number> = {
	[HeatPumpSource.Probe]: 4.5,
	[HeatPumpSource.Collector]: 4.0,
};

const BASE_HEATING_DEMAND_FACTOR = 0.05;

type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

function getWeekday(date: Date): Weekday {
	const days: Weekday[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
	return days[date.getDay()] as Weekday;
}

function parseTimeToMinutes(time: string): number {
	const [hours, minutes] = time.split(":").map(Number);
	return hours * 60 + minutes;
}

function isTimeInSlot(timeMinutes: number, slot: HeatingTimeSlot): boolean {
	const start = parseTimeToMinutes(slot.start);
	const end = parseTimeToMinutes(slot.end);

	if (start <= end) {
		return timeMinutes >= start && timeMinutes < end;
	}
	return timeMinutes >= start || timeMinutes < end;
}

function getActiveHeatingSlot(timestamp: Date, config: HeatPumpSimulationConfig): HeatingTimeSlot | null {
	const weekday = getWeekday(timestamp);
	const timeMinutes = timestamp.getHours() * 60 + timestamp.getMinutes();

	const weekdaySchedule = config.weekdaySchedules[weekday];
	const schedule = weekdaySchedule && weekdaySchedule.length > 0 ? weekdaySchedule : config.defaultSchedule;

	for (const slot of schedule) {
		if (isTimeInSlot(timeMinutes, slot)) {
			return slot;
		}
	}

	return null;
}

function calculateScheduledHeatingHoursPerDay(config: HeatPumpSimulationConfig): number {
	const schedule = config.defaultSchedule;
	if (schedule.length === 0) return 16;

	let totalMinutes = 0;
	for (const slot of schedule) {
		const start = parseTimeToMinutes(slot.start);
		const end = parseTimeToMinutes(slot.end);

		if (start <= end) {
			totalMinutes += end - start;
		} else {
			totalMinutes += 24 * 60 - start + end;
		}
	}

	return totalMinutes / 60;
}

function calculateElectricalConsumption(
	heatingHours: number,
	targetTemperature: number,
	config: HeatPumpSimulationConfig,
): number {
	const cop = COP_BY_SOURCE[config.source];

	const temperatureDelta = Math.max(0, targetTemperature - 15);

	const heatDemand = temperatureDelta * BASE_HEATING_DEMAND_FACTOR * heatingHours;

	const maxHeatOutput = config.powerKw * heatingHours;
	const actualHeatOutput = Math.min(heatDemand, maxHeatOutput);

	return actualHeatOutput / cop;
}

export function createHeatPumpSimulation(config: HeatPumpSimulationConfig): Simulation {
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

function simulateRawData(input: EnergySeries, config: HeatPumpSimulationConfig): EnergySeries {
	const result: EnergySeries = [];

	for (let i = 0; i < input.length; i++) {
		const point = input[i];
		const activeSlot = getActiveHeatingSlot(point.timestamp, config);

		let intervalHours: number;
		if (i > 0) {
			intervalHours = (point.timestamp.getTime() - input[i - 1].timestamp.getTime()) / MS_PER_HOUR;
		} else {
			intervalHours = DEFAULT_RAW_INTERVAL_MS / MS_PER_HOUR;
		}

		let heatPumpConsumption = 0;

		if (activeSlot) {
			heatPumpConsumption = calculateElectricalConsumption(intervalHours, activeSlot.targetTemperature, config);
		}

		result.push({
			...point,
			consumption: point.consumption + heatPumpConsumption,
		});
	}

	return result;
}

function simulateHourlyAggregated(input: EnergySeries, config: HeatPumpSimulationConfig): EnergySeries {
	const result: EnergySeries = [];

	for (const point of input) {
		const activeSlot = getActiveHeatingSlot(point.timestamp, config);

		let heatPumpConsumption = 0;

		if (activeSlot) {
			heatPumpConsumption = calculateElectricalConsumption(1, activeSlot.targetTemperature, config);
		}

		result.push({
			...point,
			consumption: point.consumption + heatPumpConsumption,
		});
	}

	return result;
}

function getAverageTargetTemperature(config: HeatPumpSimulationConfig): number {
	const schedule = config.defaultSchedule;
	if (schedule.length === 0) return 20;

	let totalTempMinutes = 0;
	let totalMinutes = 0;

	for (const slot of schedule) {
		const start = parseTimeToMinutes(slot.start);
		const end = parseTimeToMinutes(slot.end);

		let slotMinutes: number;
		if (start <= end) {
			slotMinutes = end - start;
		} else {
			slotMinutes = 24 * 60 - start + end;
		}

		totalTempMinutes += slot.targetTemperature * slotMinutes;
		totalMinutes += slotMinutes;
	}

	return totalMinutes > 0 ? totalTempMinutes / totalMinutes : 20;
}

function simulateDailyAggregated(input: EnergySeries, config: HeatPumpSimulationConfig): EnergySeries {
	const heatingHoursPerDay = calculateScheduledHeatingHoursPerDay(config);
	const avgTemperature = getAverageTargetTemperature(config);
	const dailyConsumption = calculateElectricalConsumption(heatingHoursPerDay, avgTemperature, config);

	const result: EnergySeries = [];

	for (const point of input) {
		result.push({
			...point,
			consumption: point.consumption + dailyConsumption,
		});
	}

	return result;
}

function simulateWeeklyAggregated(input: EnergySeries, config: HeatPumpSimulationConfig): EnergySeries {
	const heatingHoursPerDay = calculateScheduledHeatingHoursPerDay(config);
	const avgTemperature = getAverageTargetTemperature(config);
	const dailyConsumption = calculateElectricalConsumption(heatingHoursPerDay, avgTemperature, config);
	const weeklyConsumption = dailyConsumption * 7;

	const result: EnergySeries = [];

	for (const point of input) {
		result.push({
			...point,
			consumption: point.consumption + weeklyConsumption,
		});
	}

	return result;
}

function simulateMonthlyAggregated(input: EnergySeries, config: HeatPumpSimulationConfig): EnergySeries {
	const heatingHoursPerDay = calculateScheduledHeatingHoursPerDay(config);
	const avgTemperature = getAverageTargetTemperature(config);
	const dailyConsumption = calculateElectricalConsumption(heatingHoursPerDay, avgTemperature, config);
	const monthlyConsumption = dailyConsumption * 30;

	const result: EnergySeries = [];

	for (const point of input) {
		result.push({
			...point,
			consumption: point.consumption + monthlyConsumption,
		});
	}

	return result;
}

function simulateYearlyAggregated(input: EnergySeries, config: HeatPumpSimulationConfig): EnergySeries {
	const heatingHoursPerDay = calculateScheduledHeatingHoursPerDay(config);
	const avgTemperature = getAverageTargetTemperature(config);
	const dailyConsumption = calculateElectricalConsumption(heatingHoursPerDay, avgTemperature, config);
	const yearlyConsumption = dailyConsumption * 180;

	const result: EnergySeries = [];

	for (const point of input) {
		result.push({
			...point,
			consumption: point.consumption + yearlyConsumption,
		});
	}

	return result;
}
