import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";

import { SimulationType, type SimulationTypeValue } from "@/lib/enums";
import { db } from "../db";
import {
	simulationBatterySettingsTable,
	simulationEvSettingsTable,
	simulationHeatPumpSettingsTable,
	simulationSolarSettingsTable,
	simulationTouTariffSettingsTable,
	type SimulationBatterySettings,
	type SimulationEvSettings,
	type SimulationHeatPumpSettings,
	type SimulationSolarSettings,
	type SimulationTouTariffSettings,
} from "../db/tables/simulation";

export const getSimulationEvSettings = cache(async (userId: string): Promise<SimulationEvSettings | null> => {
	if (!userId || userId === "demo") {
		return null;
	}
	const result = await db
		.select()
		.from(simulationEvSettingsTable)
		.where(eq(simulationEvSettingsTable.userId, userId))
		.limit(1);
	return result[0] ?? null;
});

export const getSimulationSolarSettings = cache(async (userId: string): Promise<SimulationSolarSettings | null> => {
	if (!userId || userId === "demo") {
		return null;
	}
	const result = await db
		.select()
		.from(simulationSolarSettingsTable)
		.where(eq(simulationSolarSettingsTable.userId, userId))
		.limit(1);
	return result[0] ?? null;
});

export const getSimulationHeatPumpSettings = cache(
	async (userId: string): Promise<SimulationHeatPumpSettings | null> => {
		if (!userId || userId === "demo") {
			return null;
		}
		const result = await db
			.select()
			.from(simulationHeatPumpSettingsTable)
			.where(eq(simulationHeatPumpSettingsTable.userId, userId))
			.limit(1);
		return result[0] ?? null;
	},
);

export const getSimulationTouTariffSettings = cache(
	async (userId: string): Promise<SimulationTouTariffSettings | null> => {
		if (!userId || userId === "demo") {
			return null;
		}
		const result = await db
			.select()
			.from(simulationTouTariffSettingsTable)
			.where(eq(simulationTouTariffSettingsTable.userId, userId))
			.limit(1);
		return result[0] ?? null;
	},
);

export const getSimulationBatterySettings = cache(async (userId: string): Promise<SimulationBatterySettings | null> => {
	if (!userId || userId === "demo") {
		return null;
	}
	const result = await db
		.select()
		.from(simulationBatterySettingsTable)
		.where(eq(simulationBatterySettingsTable.userId, userId))
		.limit(1);
	return result[0] ?? null;
});

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Check if EV simulation settings have all required values for valid simulation.
 * Required: chargingSpeed, evCapacityKwh > 0
 */
export function isEvSimulationValid(settings: SimulationEvSettings | null): boolean {
	if (!settings) return false;
	return Boolean(settings.chargingSpeed) && settings.evCapacityKwh > 0;
}

/**
 * Check if Solar simulation settings have all required values for valid simulation.
 * Required: peakPower > 0, orientation
 */
export function isSolarSimulationValid(settings: SimulationSolarSettings | null): boolean {
	if (!settings) return false;
	return settings.peakPower > 0 && Boolean(settings.orientation);
}

/**
 * Check if HeatPump simulation settings have all required values for valid simulation.
 * Required: source, powerKw > 0
 */
export function isHeatPumpSimulationValid(settings: SimulationHeatPumpSettings | null): boolean {
	if (!settings) return false;
	return Boolean(settings.source) && settings.powerKw > 0;
}

/**
 * Check if Battery simulation settings have all required values for valid simulation.
 * Required: capacityKwh > 0, maxPowerKw > 0
 */
export function isBatterySimulationValid(settings: SimulationBatterySettings | null): boolean {
	if (!settings) return false;
	return settings.capacityKwh > 0 && settings.maxPowerKw > 0;
}

/**
 * Check if TOU tariff settings have all required values for valid cost calculation.
 * Required: basePrice >= 0, standardPrice > 0
 */
export function isTouTariffValid(settings: SimulationTouTariffSettings | null): boolean {
	if (!settings) return false;
	return settings.basePrice >= 0 && settings.standardPrice > 0;
}

// ============================================================================
// Types for Enabled Simulations
// ============================================================================

export interface EnabledSimulations {
	ev: SimulationEvSettings | null;
	solar: SimulationSolarSettings | null;
	heatpump: SimulationHeatPumpSettings | null;
	battery: SimulationBatterySettings | null;
	tou: SimulationTouTariffSettings | null;
}

export interface SimulationStatus {
	type: SimulationTypeValue;
	enabled: boolean;
	configured: boolean;
	valid: boolean;
}

// ============================================================================
// Query Functions for Enabled Simulations
// ============================================================================

/**
 * Get all simulation settings for a user that are both enabled AND valid.
 * Returns null for simulations that are disabled or invalid.
 */
export const getEnabledSimulations = cache(async (userId: string): Promise<EnabledSimulations> => {
	if (!userId || userId === "demo") {
		return {
			ev: null,
			solar: null,
			heatpump: null,
			battery: null,
			tou: null,
		};
	}

	const [ev, solar, heatpump, battery, tou] = await Promise.all([
		getSimulationEvSettings(userId),
		getSimulationSolarSettings(userId),
		getSimulationHeatPumpSettings(userId),
		getSimulationBatterySettings(userId),
		getSimulationTouTariffSettings(userId),
	]);

	return {
		ev: ev?.enabled && isEvSimulationValid(ev) ? ev : null,
		solar: solar?.enabled && isSolarSimulationValid(solar) ? solar : null,
		heatpump: heatpump?.enabled && isHeatPumpSimulationValid(heatpump) ? heatpump : null,
		battery: battery?.enabled && isBatterySimulationValid(battery) ? battery : null,
		tou: tou?.enabled && isTouTariffValid(tou) ? tou : null,
	};
});

/**
 * Get the status of all simulation types for a user.
 * Useful for displaying in UI which simulations are configured, enabled, and valid.
 */
export const getSimulationStatuses = cache(async (userId: string): Promise<SimulationStatus[]> => {
	if (!userId || userId === "demo") {
		return [
			{ type: SimulationType.EV, enabled: false, configured: false, valid: false },
			{ type: SimulationType.Solar, enabled: false, configured: false, valid: false },
			{ type: SimulationType.HeatPump, enabled: false, configured: false, valid: false },
			{ type: SimulationType.Battery, enabled: false, configured: false, valid: false },
			{ type: SimulationType.TOU, enabled: false, configured: false, valid: false },
		];
	}

	const [ev, solar, heatpump, battery, tou] = await Promise.all([
		getSimulationEvSettings(userId),
		getSimulationSolarSettings(userId),
		getSimulationHeatPumpSettings(userId),
		getSimulationBatterySettings(userId),
		getSimulationTouTariffSettings(userId),
	]);

	return [
		{
			type: SimulationType.EV,
			enabled: ev?.enabled ?? false,
			configured: ev !== null,
			valid: isEvSimulationValid(ev),
		},
		{
			type: SimulationType.Solar,
			enabled: solar?.enabled ?? false,
			configured: solar !== null,
			valid: isSolarSimulationValid(solar),
		},
		{
			type: SimulationType.HeatPump,
			enabled: heatpump?.enabled ?? false,
			configured: heatpump !== null,
			valid: isHeatPumpSimulationValid(heatpump),
		},
		{
			type: SimulationType.Battery,
			enabled: battery?.enabled ?? false,
			configured: battery !== null,
			valid: isBatterySimulationValid(battery),
		},
		{
			type: SimulationType.TOU,
			enabled: tou?.enabled ?? false,
			configured: tou !== null,
			valid: isTouTariffValid(tou),
		},
	];
});
