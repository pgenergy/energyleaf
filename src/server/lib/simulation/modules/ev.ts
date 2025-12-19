import type { ChargingSpeedValue } from "@/lib/enums";
import { ChargingSpeed } from "@/lib/enums";
import type { EvChargingTimeSlot, EvWeekdaySchedules } from "@/server/db/tables/simulation";
import type { EnergySeries, Simulation } from "../types";

export type EnergyAggregation = "raw" | "hour" | "weekday" | "day" | "week" | "calendar-week" | "month" | "year";

export interface EvSimulationConfig {
	chargingSpeed: ChargingSpeedValue;
	evCapacityKwh: number;
	dailyDrivingDistanceKm?: number | null;
	avgConsumptionPer100Km?: number | null;
	defaultSchedule: EvChargingTimeSlot[];
	weekdaySchedules: EvWeekdaySchedules;
	aggregation: EnergyAggregation;
}

const DEFAULT_CONSUMPTION_PER_100KM = 18;
const TARGET_CHARGE_PERCENT = 0.8;
const DEFAULT_RAW_INTERVAL_MS = 15000;

const MS_PER_HOUR = 3600000;

type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

function getChargingPowerKw(chargingSpeed: ChargingSpeedValue): number {
	switch (chargingSpeed) {
		case ChargingSpeed.Seven:
			return 7;
		case ChargingSpeed.Eleven:
			return 11;
		default:
			return 11;
	}
}

function getWeekday(date: Date): Weekday {
	const days: Weekday[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
	return days[date.getDay()] as Weekday;
}

function parseTimeToMinutes(time: string): number {
	const [hours, minutes] = time.split(":").map(Number);
	return hours * 60 + minutes;
}

function isTimeInSlot(timeMinutes: number, slot: EvChargingTimeSlot): boolean {
	const start = parseTimeToMinutes(slot.start);
	const end = parseTimeToMinutes(slot.end);

	if (start <= end) {
		return timeMinutes >= start && timeMinutes < end;
	}
	return timeMinutes >= start || timeMinutes < end;
}

function isInChargingSchedule(timestamp: Date, config: EvSimulationConfig): boolean {
	const weekday = getWeekday(timestamp);
	const timeMinutes = timestamp.getHours() * 60 + timestamp.getMinutes();

	const weekdaySchedule = config.weekdaySchedules[weekday];
	const schedule = weekdaySchedule && weekdaySchedule.length > 0 ? weekdaySchedule : config.defaultSchedule;

	return schedule.some((slot) => isTimeInSlot(timeMinutes, slot));
}

function isOvernightSlot(slot: EvChargingTimeSlot): boolean {
	const startMinutes = parseTimeToMinutes(slot.start);
	const endMinutes = parseTimeToMinutes(slot.end);
	return startMinutes > endMinutes;
}

function getScheduleForDate(date: Date, config: EvSimulationConfig): EvChargingTimeSlot[] {
	const weekday = getWeekday(date);
	const weekdaySchedule = config.weekdaySchedules[weekday];
	return weekdaySchedule && weekdaySchedule.length > 0 ? weekdaySchedule : config.defaultSchedule;
}

function isSingleDayData(input: EnergySeries): boolean {
	if (input.length === 0) return true;
	const firstDay = input[0].timestamp.toISOString().split("T")[0];
	const lastDay = input[input.length - 1].timestamp.toISOString().split("T")[0];
	return firstDay === lastDay;
}

function calculateInitialChargeState(
	config: EvSimulationConfig,
	chargingPowerKw: number,
	targetChargeKwh: number,
	dailyDrivingConsumption: number,
	firstDataPoint: Date,
): number {
	if (dailyDrivingConsumption <= 0) {
		return targetChargeKwh;
	}

	const chargeAfterDriving = Math.max(0, targetChargeKwh - dailyDrivingConsumption);

	const previousDay = new Date(firstDataPoint);
	previousDay.setDate(previousDay.getDate() - 1);
	const previousDaySchedule = getScheduleForDate(previousDay, config);

	for (const slot of previousDaySchedule) {
		if (isOvernightSlot(slot)) {
			const startMinutes = parseTimeToMinutes(slot.start);
			const hoursUntilMidnight = (24 * 60 - startMinutes) / 60;

			const chargeNeeded = targetChargeKwh - chargeAfterDriving;
			const previousEveningCharge = Math.min(chargingPowerKw * hoursUntilMidnight, Math.max(0, chargeNeeded));

			return chargeAfterDriving + previousEveningCharge;
		}
	}

	return chargeAfterDriving;
}

function calculateDailyDrivingConsumption(config: EvSimulationConfig): number {
	if (!config.dailyDrivingDistanceKm || config.dailyDrivingDistanceKm <= 0) {
		return 0;
	}

	const consumptionPer100Km = config.avgConsumptionPer100Km ?? DEFAULT_CONSUMPTION_PER_100KM;
	return (config.dailyDrivingDistanceKm / 100) * consumptionPer100Km;
}

function calculateScheduledChargingHoursPerDay(config: EvSimulationConfig): number {
	const schedule = config.defaultSchedule;
	if (schedule.length === 0) return 8;

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

export function createEvSimulation(config: EvSimulationConfig): Simulation {
	return async (input: EnergySeries): Promise<EnergySeries> => {
		if (input.length === 0) {
			return input;
		}

		const chargingPowerKw = getChargingPowerKw(config.chargingSpeed);
		const targetChargeKwh = config.evCapacityKwh * TARGET_CHARGE_PERCENT;
		const dailyDrivingConsumption = calculateDailyDrivingConsumption(config);

		switch (config.aggregation) {
			case "raw":
				return simulateRawData(
					input,
					config,
					chargingPowerKw,
					targetChargeKwh,
					dailyDrivingConsumption,
					DEFAULT_RAW_INTERVAL_MS,
				);

			case "hour":
				return simulateHourlyAggregated(
					input,
					config,
					chargingPowerKw,
					targetChargeKwh,
					dailyDrivingConsumption,
				);

			case "day":
			case "weekday":
				return simulateDailyAggregated(
					input,
					config,
					chargingPowerKw,
					targetChargeKwh,
					dailyDrivingConsumption,
				);

			case "week":
			case "calendar-week":
				return simulateWeeklyAggregated(
					input,
					config,
					chargingPowerKw,
					targetChargeKwh,
					dailyDrivingConsumption,
				);

			case "month":
				return simulateMonthlyAggregated(
					input,
					config,
					chargingPowerKw,
					targetChargeKwh,
					dailyDrivingConsumption,
				);

			case "year":
				return simulateYearlyAggregated(
					input,
					config,
					chargingPowerKw,
					targetChargeKwh,
					dailyDrivingConsumption,
				);

			default:
				return simulateRawData(
					input,
					config,
					chargingPowerKw,
					targetChargeKwh,
					dailyDrivingConsumption,
					DEFAULT_RAW_INTERVAL_MS,
				);
		}
	};
}

function simulateRawData(
	input: EnergySeries,
	config: EvSimulationConfig,
	chargingPowerKw: number,
	targetChargeKwh: number,
	dailyDrivingConsumption: number,
	detectedIntervalMs: number,
): EnergySeries {
	const singleDay = isSingleDayData(input);

	let currentChargeKwh: number;
	if (singleDay) {
		currentChargeKwh = calculateInitialChargeState(
			config,
			chargingPowerKw,
			targetChargeKwh,
			dailyDrivingConsumption,
			input[0].timestamp,
		);
	} else {
		currentChargeKwh = targetChargeKwh;
	}

	let wasInChargingSchedule = false;
	const result: EnergySeries = [];

	for (let i = 0; i < input.length; i++) {
		const point = input[i];
		const inChargingSchedule = isInChargingSchedule(point.timestamp, config);

		if (!singleDay && wasInChargingSchedule && !inChargingSchedule) {
			currentChargeKwh = Math.max(0, currentChargeKwh - dailyDrivingConsumption);
		}

		let intervalHours: number;
		if (i > 0) {
			intervalHours = (point.timestamp.getTime() - input[i - 1].timestamp.getTime()) / MS_PER_HOUR;
		} else {
			intervalHours = detectedIntervalMs / MS_PER_HOUR;
		}

		let chargingConsumption = 0;

		if (inChargingSchedule && currentChargeKwh < targetChargeKwh) {
			const maxChargeThisInterval = chargingPowerKw * intervalHours;
			const chargeNeeded = targetChargeKwh - currentChargeKwh;
			const actualCharge = Math.min(maxChargeThisInterval, chargeNeeded);

			currentChargeKwh += actualCharge;
			chargingConsumption = actualCharge;
		}

		wasInChargingSchedule = inChargingSchedule;

		result.push({
			...point,
			consumption: point.consumption + chargingConsumption,
			value: point.value + chargingConsumption,
			valueCurrent: point.valueCurrent ? point.valueCurrent + chargingConsumption : null,
		});
	}

	return result;
}

function simulateHourlyAggregated(
	input: EnergySeries,
	config: EvSimulationConfig,
	chargingPowerKw: number,
	targetChargeKwh: number,
	dailyDrivingConsumption: number,
): EnergySeries {
	const singleDay = isSingleDayData(input);

	let currentChargeKwh: number;
	if (singleDay) {
		currentChargeKwh = calculateInitialChargeState(
			config,
			chargingPowerKw,
			targetChargeKwh,
			dailyDrivingConsumption,
			input[0].timestamp,
		);
	} else {
		currentChargeKwh = targetChargeKwh;
	}

	let lastDate: string | null = null;
	let hasChargedToday = false;
	const result: EnergySeries = [];

	for (const point of input) {
		const currentDate = point.timestamp.toISOString().split("T")[0];

		if (!singleDay && lastDate !== null && lastDate !== currentDate && hasChargedToday) {
			currentChargeKwh = Math.max(0, currentChargeKwh - dailyDrivingConsumption);
			hasChargedToday = false;
		}
		lastDate = currentDate;

		const hourStart = point.timestamp.getHours() * 60;
		const hourEnd = hourStart + 60;
		const overlapFraction = calculateScheduleOverlap(hourStart, hourEnd, config);

		let chargingConsumption = 0;

		if (overlapFraction > 0 && currentChargeKwh < targetChargeKwh) {
			const maxChargeThisHour = chargingPowerKw * overlapFraction;
			const chargeNeeded = targetChargeKwh - currentChargeKwh;
			const actualCharge = Math.min(maxChargeThisHour, chargeNeeded);

			currentChargeKwh += actualCharge;
			chargingConsumption = actualCharge;
			hasChargedToday = true;
		}

		result.push({
			...point,
			consumption: point.consumption + chargingConsumption,
		});
	}

	return result;
}

function calculateScheduleOverlap(startMinutes: number, endMinutes: number, config: EvSimulationConfig): number {
	const schedule = config.defaultSchedule;
	if (schedule.length === 0) return 0;

	let overlapMinutes = 0;
	const rangeLength = endMinutes - startMinutes;

	for (const slot of schedule) {
		const slotStart = parseTimeToMinutes(slot.start);
		const slotEnd = parseTimeToMinutes(slot.end);

		if (slotStart <= slotEnd) {
			const overlapStart = Math.max(startMinutes, slotStart);
			const overlapEnd = Math.min(endMinutes, slotEnd);
			if (overlapEnd > overlapStart) {
				overlapMinutes += overlapEnd - overlapStart;
			}
		} else {
			const eveningOverlapStart = Math.max(startMinutes, slotStart);
			const eveningOverlapEnd = Math.min(endMinutes, 24 * 60);
			if (eveningOverlapEnd > eveningOverlapStart) {
				overlapMinutes += eveningOverlapEnd - eveningOverlapStart;
			}
			const morningOverlapStart = Math.max(startMinutes, 0);
			const morningOverlapEnd = Math.min(endMinutes, slotEnd);
			if (morningOverlapEnd > morningOverlapStart) {
				overlapMinutes += morningOverlapEnd - morningOverlapStart;
			}
		}
	}

	return Math.min(overlapMinutes / rangeLength, 1);
}

function simulateDailyAggregated(
	input: EnergySeries,
	config: EvSimulationConfig,
	chargingPowerKw: number,
	targetChargeKwh: number,
	dailyDrivingConsumption: number,
): EnergySeries {
	const scheduledHoursPerDay = calculateScheduledChargingHoursPerDay(config);
	const result: EnergySeries = [];

	for (const point of input) {
		const maxDailyCharge = chargingPowerKw * scheduledHoursPerDay;
		const chargeNeeded = Math.min(dailyDrivingConsumption, targetChargeKwh);
		const chargingConsumption = Math.min(chargeNeeded, maxDailyCharge);

		result.push({
			...point,
			consumption: point.consumption + chargingConsumption,
		});
	}

	return result;
}

function simulateWeeklyAggregated(
	input: EnergySeries,
	config: EvSimulationConfig,
	chargingPowerKw: number,
	targetChargeKwh: number,
	dailyDrivingConsumption: number,
): EnergySeries {
	const scheduledHoursPerDay = calculateScheduledChargingHoursPerDay(config);
	const result: EnergySeries = [];

	for (const point of input) {
		const weeklyDrivingConsumption = dailyDrivingConsumption * 7;
		const maxWeeklyCharge = chargingPowerKw * scheduledHoursPerDay * 7;
		const chargeNeeded = Math.min(weeklyDrivingConsumption, targetChargeKwh * 7);
		const chargingConsumption = Math.min(chargeNeeded, maxWeeklyCharge);

		result.push({
			...point,
			consumption: point.consumption + chargingConsumption,
		});
	}

	return result;
}

function simulateMonthlyAggregated(
	input: EnergySeries,
	config: EvSimulationConfig,
	chargingPowerKw: number,
	targetChargeKwh: number,
	dailyDrivingConsumption: number,
): EnergySeries {
	const scheduledHoursPerDay = calculateScheduledChargingHoursPerDay(config);
	const daysPerMonth = 30;
	const result: EnergySeries = [];

	for (const point of input) {
		const monthlyDrivingConsumption = dailyDrivingConsumption * daysPerMonth;
		const maxMonthlyCharge = chargingPowerKw * scheduledHoursPerDay * daysPerMonth;
		const chargeNeeded = Math.min(monthlyDrivingConsumption, targetChargeKwh * daysPerMonth);
		const chargingConsumption = Math.min(chargeNeeded, maxMonthlyCharge);

		result.push({
			...point,
			consumption: point.consumption + chargingConsumption,
		});
	}

	return result;
}

function simulateYearlyAggregated(
	input: EnergySeries,
	config: EvSimulationConfig,
	chargingPowerKw: number,
	targetChargeKwh: number,
	dailyDrivingConsumption: number,
): EnergySeries {
	const scheduledHoursPerDay = calculateScheduledChargingHoursPerDay(config);
	const daysPerYear = 365;
	const result: EnergySeries = [];

	for (const point of input) {
		const yearlyDrivingConsumption = dailyDrivingConsumption * daysPerYear;
		const maxYearlyCharge = chargingPowerKw * scheduledHoursPerDay * daysPerYear;
		const chargeNeeded = Math.min(yearlyDrivingConsumption, targetChargeKwh * daysPerYear);
		const chargingConsumption = Math.min(chargeNeeded, maxYearlyCharge);

		result.push({
			...point,
			consumption: point.consumption + chargingConsumption,
		});
	}

	return result;
}
