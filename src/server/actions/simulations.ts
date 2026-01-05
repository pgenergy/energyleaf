"use server";

import { waitUntil } from "@vercel/functions";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { z } from "zod";
import { SimulationType, type SimulationTypeValue } from "@/lib/enums";
import { ErrorTypes, LogActionTypes } from "@/lib/log-types";
import {
	batterySettingsSchema,
	evSettingsSchema,
	heatPumpSettingsSchema,
	solarSettingsSchema,
	touTariffSchema,
} from "@/lib/schemas/profile-schema";
import { db } from "../db";
import {
	simulationBatterySettingsTable,
	simulationEvSettingsTable,
	simulationHeatPumpSettingsTable,
	simulationSolarSettingsTable,
	simulationTouTariffSettingsTable,
} from "../db/tables/simulation";
import { getCurrentSession } from "../lib/auth";
import { logAction, logError } from "../queries/logs";

interface ActionResult {
	success: boolean;
	message: string;
}

export async function updateSimulationEvSettingsAction(data: z.infer<typeof evSettingsSchema>): Promise<ActionResult> {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value ?? null;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_SIMULATION_EV_SETTINGS_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.NOT_LOGGED_IN,
						user: null,
						session: sid,
					},
				}),
			);
			return {
				success: false,
				message: "Sie müssen angemeldet sein, um EV-Simulationen zu speichern.",
			};
		}

		const validate = evSettingsSchema.safeParse(data);
		if (!validate.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_SIMULATION_EV_SETTINGS_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.INVALID_INPUT,
						user: user.id,
						session: sid,
						data,
					},
				}),
			);
			return {
				success: false,
				message: "Die Daten sind nicht gültig.",
			};
		}

		if (user.id === "demo") {
			return {
				success: true,
				message: "Im Demo-Modus werden EV-Simulationen nicht gespeichert.",
			};
		}

		const payload = validate.data;
		const existing = await db
			.select()
			.from(simulationEvSettingsTable)
			.where(eq(simulationEvSettingsTable.userId, user.id))
			.limit(1);

		await db
			.insert(simulationEvSettingsTable)
			.values({
				userId: user.id,
				chargingSpeed: payload.chargingSpeed,
				evCapacityKwh: payload.evCapacityKwh,
				dailyDrivingDistanceKm: payload.dailyDrivingDistanceKm ?? null,
				avgConsumptionPer100Km: payload.avgConsumptionPer100Km ?? null,
				defaultSchedule: payload.defaultSchedule,
				weekdaySchedules: payload.weekdaySchedules,
			})
			.onConflictDoUpdate({
				target: simulationEvSettingsTable.userId,
				set: {
					chargingSpeed: payload.chargingSpeed,
					evCapacityKwh: payload.evCapacityKwh,
					dailyDrivingDistanceKm: payload.dailyDrivingDistanceKm ?? null,
					avgConsumptionPer100Km: payload.avgConsumptionPer100Km ?? null,
					defaultSchedule: payload.defaultSchedule,
					weekdaySchedules: payload.weekdaySchedules,
					updatedAt: sql`now()`,
				},
			});

		revalidatePath("/settings");
		waitUntil(
			logAction({
				fn: LogActionTypes.UPDATE_SIMULATION_EV_SETTINGS_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					reason: null,
					success: true,
					data: {
						old: existing[0] ?? null,
						new: payload,
					},
				},
			}),
		);

		return {
			success: true,
			message: "EV-Simulation gespeichert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.UPDATE_SIMULATION_EV_SETTINGS_ACTION,
				error: err as Error,
				details: {
					user: null,
					session: null,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function updateSimulationSolarSettingsAction(
	data: z.infer<typeof solarSettingsSchema>,
): Promise<ActionResult> {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value ?? null;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_SIMULATION_SOLAR_SETTINGS_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.NOT_LOGGED_IN,
						user: null,
						session: sid,
					},
				}),
			);
			return {
				success: false,
				message: "Sie müssen angemeldet sein, um Solar-Simulationen zu speichern.",
			};
		}

		const validate = solarSettingsSchema.safeParse(data);
		if (!validate.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_SIMULATION_SOLAR_SETTINGS_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.INVALID_INPUT,
						user: user.id,
						session: sid,
						data,
					},
				}),
			);
			return {
				success: false,
				message: "Die Daten sind nicht gültig.",
			};
		}

		if (user.id === "demo") {
			return {
				success: true,
				message: "Im Demo-Modus werden Solar-Simulationen nicht gespeichert.",
			};
		}

		const payload = validate.data;
		const inverterPower = payload.inverterPower === "" ? null : payload.inverterPower;
		const sunHoursPerDay = payload.sunHoursPerDay ?? null;
		const existing = await db
			.select()
			.from(simulationSolarSettingsTable)
			.where(eq(simulationSolarSettingsTable.userId, user.id))
			.limit(1);

		await db
			.insert(simulationSolarSettingsTable)
			.values({
				userId: user.id,
				peakPower: payload.peakPower,
				orientation: payload.orientation,
				inverterPower,
				sunHoursPerDay,
			})
			.onConflictDoUpdate({
				target: simulationSolarSettingsTable.userId,
				set: {
					peakPower: payload.peakPower,
					orientation: payload.orientation,
					inverterPower,
					sunHoursPerDay,
					updatedAt: sql`now()`,
				},
			});

		revalidatePath("/settings");
		waitUntil(
			logAction({
				fn: LogActionTypes.UPDATE_SIMULATION_SOLAR_SETTINGS_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					reason: null,
					success: true,
					data: {
						old: existing[0] ?? null,
						new: {
							...payload,
							inverterPower,
						},
					},
				},
			}),
		);

		return {
			success: true,
			message: "Solar-Simulation gespeichert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.UPDATE_SIMULATION_SOLAR_SETTINGS_ACTION,
				error: err as Error,
				details: {
					user: null,
					session: null,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function updateSimulationHeatPumpSettingsAction(
	data: z.infer<typeof heatPumpSettingsSchema>,
): Promise<ActionResult> {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value ?? null;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_SIMULATION_HEAT_PUMP_SETTINGS_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.NOT_LOGGED_IN,
						user: null,
						session: sid,
					},
				}),
			);
			return {
				success: false,
				message: "Sie müssen angemeldet sein, um Wärmepumpen-Simulationen zu speichern.",
			};
		}

		const validate = heatPumpSettingsSchema.safeParse(data);
		if (!validate.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_SIMULATION_HEAT_PUMP_SETTINGS_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.INVALID_INPUT,
						user: user.id,
						session: sid,
						data,
					},
				}),
			);
			return {
				success: false,
				message: "Die Daten sind nicht gültig.",
			};
		}

		if (user.id === "demo") {
			return {
				success: true,
				message: "Im Demo-Modus werden Wärmepumpen-Simulationen nicht gespeichert.",
			};
		}

		const payload = validate.data;
		const existing = await db
			.select()
			.from(simulationHeatPumpSettingsTable)
			.where(eq(simulationHeatPumpSettingsTable.userId, user.id))
			.limit(1);

		await db
			.insert(simulationHeatPumpSettingsTable)
			.values({
				userId: user.id,
				source: payload.source,
				powerKw: payload.powerKw,
				bufferLiter: payload.bufferLiter ?? null,
				defaultSchedule: payload.defaultSchedule,
				weekdaySchedules: payload.weekdaySchedules,
			})
			.onConflictDoUpdate({
				target: simulationHeatPumpSettingsTable.userId,
				set: {
					source: payload.source,
					powerKw: payload.powerKw,
					bufferLiter: payload.bufferLiter ?? null,
					defaultSchedule: payload.defaultSchedule,
					weekdaySchedules: payload.weekdaySchedules,
					updatedAt: sql`now()`,
				},
			});

		revalidatePath("/settings");
		waitUntil(
			logAction({
				fn: LogActionTypes.UPDATE_SIMULATION_HEAT_PUMP_SETTINGS_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					reason: null,
					success: true,
					data: {
						old: existing[0] ?? null,
						new: payload,
					},
				},
			}),
		);

		return {
			success: true,
			message: "Wärmepumpen-Simulation gespeichert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.UPDATE_SIMULATION_HEAT_PUMP_SETTINGS_ACTION,
				error: err as Error,
				details: {
					user: null,
					session: null,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function updateSimulationTouTariffSettingsAction(
	data: z.infer<typeof touTariffSchema>,
): Promise<ActionResult> {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value ?? null;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_SIMULATION_TOU_SETTINGS_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.NOT_LOGGED_IN,
						user: null,
						session: sid,
					},
				}),
			);
			return {
				success: false,
				message: "Sie müssen angemeldet sein, um TOU-Simulationen zu speichern.",
			};
		}

		const validate = touTariffSchema.safeParse(data);
		if (!validate.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_SIMULATION_TOU_SETTINGS_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.INVALID_INPUT,
						user: user.id,
						session: sid,
						data,
					},
				}),
			);
			return {
				success: false,
				message: "Die Daten sind nicht gültig.",
			};
		}

		if (user.id === "demo") {
			return {
				success: true,
				message: "Im Demo-Modus werden TOU-Simulationen nicht gespeichert.",
			};
		}

		const payload = validate.data;
		const existing = await db
			.select()
			.from(simulationTouTariffSettingsTable)
			.where(eq(simulationTouTariffSettingsTable.userId, user.id))
			.limit(1);

		await db
			.insert(simulationTouTariffSettingsTable)
			.values({
				userId: user.id,
				pricingMode: payload.pricingMode,
				basePrice: payload.basePrice,
				standardPrice: payload.standardPrice,
				zones: payload.zones ?? [],
				weekdayZones: payload.weekdayZones,
				spotMarkup: payload.spotMarkup ?? 3,
			})
			.onConflictDoUpdate({
				target: simulationTouTariffSettingsTable.userId,
				set: {
					pricingMode: payload.pricingMode,
					basePrice: payload.basePrice,
					standardPrice: payload.standardPrice,
					zones: payload.zones ?? [],
					weekdayZones: payload.weekdayZones,
					spotMarkup: payload.spotMarkup ?? 3,
					updatedAt: sql`now()`,
				},
			});

		revalidatePath("/settings");
		waitUntil(
			logAction({
				fn: LogActionTypes.UPDATE_SIMULATION_TOU_SETTINGS_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					reason: null,
					success: true,
					data: {
						old: existing[0] ?? null,
						new: payload,
					},
				},
			}),
		);

		return {
			success: true,
			message: "TOU-Simulation gespeichert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.UPDATE_SIMULATION_TOU_SETTINGS_ACTION,
				error: err as Error,
				details: {
					user: null,
					session: null,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function updateSimulationBatterySettingsAction(
	data: z.infer<typeof batterySettingsSchema>,
): Promise<ActionResult> {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value ?? null;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_SIMULATION_BATTERY_SETTINGS_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.NOT_LOGGED_IN,
						user: null,
						session: sid,
					},
				}),
			);
			return {
				success: false,
				message: "Sie müssen angemeldet sein, um Batteriespeicher-Simulationen zu speichern.",
			};
		}

		const validate = batterySettingsSchema.safeParse(data);
		if (!validate.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_SIMULATION_BATTERY_SETTINGS_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.INVALID_INPUT,
						user: user.id,
						session: sid,
						data,
					},
				}),
			);
			return {
				success: false,
				message: "Die Daten sind nicht gültig.",
			};
		}

		if (user.id === "demo") {
			return {
				success: true,
				message: "Im Demo-Modus werden Batteriespeicher-Simulationen nicht gespeichert.",
			};
		}

		const payload = validate.data;
		const existing = await db
			.select()
			.from(simulationBatterySettingsTable)
			.where(eq(simulationBatterySettingsTable.userId, user.id))
			.limit(1);

		await db
			.insert(simulationBatterySettingsTable)
			.values({
				userId: user.id,
				capacityKwh: payload.capacityKwh,
				maxPowerKw: payload.maxPowerKw,
			})
			.onConflictDoUpdate({
				target: simulationBatterySettingsTable.userId,
				set: {
					capacityKwh: payload.capacityKwh,
					maxPowerKw: payload.maxPowerKw,
					updatedAt: sql`now()`,
				},
			});

		revalidatePath("/settings");
		waitUntil(
			logAction({
				fn: LogActionTypes.UPDATE_SIMULATION_BATTERY_SETTINGS_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					reason: null,
					success: true,
					data: {
						old: existing[0] ?? null,
						new: payload,
					},
				},
			}),
		);

		return {
			success: true,
			message: "Batteriespeicher-Simulation gespeichert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.UPDATE_SIMULATION_BATTERY_SETTINGS_ACTION,
				error: err as Error,
				details: {
					user: null,
					session: null,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

/**
 * Toggle simulation enabled/disabled status
 */
export async function toggleSimulationEnabledAction(
	simulationType: SimulationTypeValue,
	enabled: boolean,
): Promise<ActionResult> {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value ?? null;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.TOGGLE_SIMULATION_ENABLED_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.NOT_LOGGED_IN,
						user: null,
						session: sid,
					},
				}),
			);
			return {
				success: false,
				message: "Sie müssen angemeldet sein, um Simulationen zu aktivieren/deaktivieren.",
			};
		}

		if (user.id === "demo") {
			return {
				success: true,
				message: "Im Demo-Modus werden Simulationseinstellungen nicht gespeichert.",
			};
		}

		const tableMap = {
			[SimulationType.EV]: simulationEvSettingsTable,
			[SimulationType.Solar]: simulationSolarSettingsTable,
			[SimulationType.HeatPump]: simulationHeatPumpSettingsTable,
			[SimulationType.Battery]: simulationBatterySettingsTable,
			[SimulationType.TOU]: simulationTouTariffSettingsTable,
		};

		const table = tableMap[simulationType];
		if (!table) {
			return {
				success: false,
				message: "Ungültiger Simulationstyp.",
			};
		}

		await db
			.update(table)
			.set({
				enabled,
				updatedAt: sql`now()`,
			})
			.where(eq(table.userId, user.id));

		revalidatePath("/settings");
		waitUntil(
			logAction({
				fn: LogActionTypes.TOGGLE_SIMULATION_ENABLED_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					reason: null,
					success: true,
					data: {
						simulationType,
						enabled,
					},
				},
			}),
		);

		return {
			success: true,
			message: enabled ? "Simulation aktiviert." : "Simulation deaktiviert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.TOGGLE_SIMULATION_ENABLED_ACTION,
				error: err as Error,
				details: {
					user: null,
					session: null,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}
