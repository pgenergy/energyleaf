import { getWarmupEnergyForSensor } from "@/server/queries/energy";
import { type EnabledSimulations, getEnabledSimulations } from "@/server/queries/simulations";
import {
	type EnergyAggregation as BatteryAggregation,
	createBatterySimulation,
	extractBatteryFinalState,
} from "./modules/battery";
import { createEvSimulation, type EnergyAggregation as EvAggregation, extractEvFinalState } from "./modules/ev";
import { createHeatPumpSimulation, type EnergyAggregation as HeatPumpAggregation } from "./modules/heatpump";
import { createSolarSimulation, type EnergyAggregation as SolarAggregation } from "./modules/solar";
import type { EnergySeries, Simulation } from "./types";

export type EnergyAggregation = SolarAggregation | EvAggregation | HeatPumpAggregation | BatteryAggregation;

const WARMUP_WORTHY_AGGREGATIONS: EnergyAggregation[] = ["raw", "hour", "day", "weekday"];

function isWarmupWorthyAggregation(agg: EnergyAggregation): boolean {
	return WARMUP_WORTHY_AGGREGATIONS.includes(agg);
}

function hasActiveSimulations(settings: EnabledSimulations): boolean {
	return !!(settings.ev || settings.solar || settings.heatpump || settings.battery);
}

export const runSimulations = async (input: EnergySeries, sims: Simulation[]): Promise<EnergySeries> => {
	let currentSeries = input;
	for (const sim of sims) {
		currentSeries = await sim(currentSeries);
	}
	return currentSeries;
};

export interface SetupSimulationsOptions {
	aggregation: EnergyAggregation;
	initialBatteryCharge?: number;
	initialEvCharge?: number;
}

export function setupSimulationsFromSettings(
	settings: EnabledSimulations,
	options: SetupSimulationsOptions,
): Simulation[] {
	const simulations: Simulation[] = [];

	if (settings.ev) {
		simulations.push(
			createEvSimulation({
				chargingSpeed: settings.ev.chargingSpeed,
				evCapacityKwh: settings.ev.evCapacityKwh,
				dailyDrivingDistanceKm: settings.ev.dailyDrivingDistanceKm,
				avgConsumptionPer100Km: settings.ev.avgConsumptionPer100Km,
				defaultSchedule: settings.ev.defaultSchedule,
				weekdaySchedules: settings.ev.weekdaySchedules,
				aggregation: options.aggregation,
				initialStateOfCharge: options.initialEvCharge,
			}),
		);
	}

	if (settings.heatpump) {
		simulations.push(
			createHeatPumpSimulation({
				source: settings.heatpump.source,
				powerKw: settings.heatpump.powerKw,
				bufferLiter: settings.heatpump.bufferLiter,
				defaultSchedule: settings.heatpump.defaultSchedule,
				weekdaySchedules: settings.heatpump.weekdaySchedules,
				aggregation: options.aggregation,
			}),
		);
	}

	if (settings.solar) {
		simulations.push(
			createSolarSimulation({
				peakPower: settings.solar.peakPower,
				orientation: settings.solar.orientation,
				inverterPower: settings.solar.inverterPower,
				sunHoursPerDay: settings.solar.sunHoursPerDay,
				aggregation: options.aggregation,
			}),
		);
	}

	if (settings.battery) {
		simulations.push(
			createBatterySimulation({
				capacityKwh: settings.battery.capacityKwh,
				maxPowerKw: settings.battery.maxPowerKw,
				initialStateOfCharge: options.initialBatteryCharge,
				aggregation: options.aggregation,
			}),
		);
	}

	return simulations;
}

export async function setupEnabledSimulations(userId: string, options: SetupSimulationsOptions): Promise<Simulation[]> {
	const settings = await getEnabledSimulations(userId);
	return setupSimulationsFromSettings(settings, options);
}

export interface WarmupOptions {
	sensorId: string;
	startDate: Date;
	warmupDays?: number;
}

export async function runSimulationsWithWarmup(
	input: EnergySeries,
	userId: string,
	options: SetupSimulationsOptions & WarmupOptions,
): Promise<EnergySeries> {
	const settings = await getEnabledSimulations(userId);

	if (!hasActiveSimulations(settings)) {
		return input;
	}

	const needsWarmup = (settings.battery || settings.ev) && isWarmupWorthyAggregation(options.aggregation);

	if (!needsWarmup) {
		const sims = setupSimulationsFromSettings(settings, options);
		return runSimulations(input, sims);
	}

	const warmupData = await getWarmupEnergyForSensor(options.startDate, options.sensorId, options.warmupDays ?? 5);

	if (warmupData.length === 0) {
		const sims = setupSimulationsFromSettings(settings, options);
		return runSimulations(input, sims);
	}

	const warmupSims = setupSimulationsFromSettings(settings, { aggregation: "hour" });
	const warmupResult = await runSimulations(warmupData, warmupSims);

	const finalBatteryCharge = settings.battery
		? extractBatteryFinalState(warmupResult, {
				capacityKwh: settings.battery.capacityKwh,
				maxPowerKw: settings.battery.maxPowerKw,
				aggregation: "hour",
			})
		: undefined;

	const finalEvCharge = settings.ev
		? extractEvFinalState(warmupResult, {
				chargingSpeed: settings.ev.chargingSpeed,
				evCapacityKwh: settings.ev.evCapacityKwh,
				dailyDrivingDistanceKm: settings.ev.dailyDrivingDistanceKm,
				avgConsumptionPer100Km: settings.ev.avgConsumptionPer100Km,
				defaultSchedule: settings.ev.defaultSchedule,
				weekdaySchedules: settings.ev.weekdaySchedules,
				aggregation: "hour",
			})
		: undefined;

	const actualSims = setupSimulationsFromSettings(settings, {
		...options,
		initialBatteryCharge: finalBatteryCharge,
		initialEvCharge: finalEvCharge,
	});
	return runSimulations(input, actualSims);
}
