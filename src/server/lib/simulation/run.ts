import { type EnabledSimulations, getEnabledSimulations } from "@/server/queries/simulations";
import { createBatterySimulation, type EnergyAggregation as BatteryAggregation } from "./modules/battery";
import { createEvSimulation, type EnergyAggregation as EvAggregation } from "./modules/ev";
import { createHeatPumpSimulation, type EnergyAggregation as HeatPumpAggregation } from "./modules/heatpump";
import { createSolarSimulation, type EnergyAggregation as SolarAggregation } from "./modules/solar";
import type { EnergySeries, Simulation } from "./types";

export type EnergyAggregation = SolarAggregation | EvAggregation | HeatPumpAggregation | BatteryAggregation;

export const runSimulations = async (input: EnergySeries, sims: Simulation[]): Promise<EnergySeries> => {
	let currentSeries = input;
	for (const sim of sims) {
		currentSeries = await sim(currentSeries);
	}
	return currentSeries;
};

export interface SetupSimulationsOptions {
	aggregation: EnergyAggregation;
}

/**
 * Creates simulation functions from enabled user settings.
 * Order: EV -> HeatPump -> Solar -> Battery
 * - EV and HeatPump add consumption first
 * - Solar generates energy (second last)
 * - Battery stores excess and discharges (must be last)
 */
export function setupSimulationsFromSettings(
	settings: EnabledSimulations,
	options: SetupSimulationsOptions,
): Simulation[] {
	const simulations: Simulation[] = [];

	// 1. EV - adds consumption
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
			}),
		);
	}

	// 2. HeatPump - adds consumption
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

	// 3. Solar (second last) - generates energy, reduces consumption, increases valueOut
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

	// 4. Battery MUST be last - stores excess solar and discharges for consumption
	if (settings.battery) {
		simulations.push(
			createBatterySimulation({
				capacityKwh: settings.battery.capacityKwh,
				maxPowerKw: settings.battery.maxPowerKw,
				initialStateOfCharge: settings.battery.initialStateOfCharge,
				aggregation: options.aggregation,
			}),
		);
	}

	return simulations;
}

/**
 * Fetches enabled simulations for a user and creates simulation functions.
 * Order: EV -> HeatPump -> Solar -> Battery
 */
export async function setupEnabledSimulations(userId: string, options: SetupSimulationsOptions): Promise<Simulation[]> {
	const settings = await getEnabledSimulations(userId);
	return setupSimulationsFromSettings(settings, options);
}

/**
 * Fetches enabled simulations for a user and runs them on the input energy series.
 * Order: EV -> HeatPump -> Solar -> Battery
 */
export async function runEnabledSimulations(
	input: EnergySeries,
	userId: string,
	options: SetupSimulationsOptions,
): Promise<EnergySeries> {
	const simulations = await setupEnabledSimulations(userId, options);
	return runSimulations(input, simulations);
}
