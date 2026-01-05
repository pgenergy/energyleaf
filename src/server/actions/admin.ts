"use server";

import { hash } from "@node-rs/argon2";
import { waitUntil } from "@vercel/functions";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { z } from "zod";
import { SimulationType, type SimulationTypeValue } from "@/lib/enums";
import { ErrorTypes, LogActionTypes } from "@/lib/log-types";
import { adminCreateUserSchema, adminHintConfigSchema } from "@/lib/schemas/admin-schema";
import {
	accountInfoSchema,
	accountNameSchema,
	adminAccountStatusSchema,
	batterySettingsSchema,
	energyTarfiffSchema,
	evSettingsSchema,
	heatPumpSettingsSchema,
	householdSchema,
	solarSettingsSchema,
	touTariffSchema,
} from "@/lib/schemas/profile-schema";
import { genID } from "@/lib/utils";
import { db } from "../db";
import { reportConfigTable } from "../db/tables/reports";
import {
	simulationBatterySettingsTable,
	simulationEvSettingsTable,
	simulationHeatPumpSettingsTable,
	simulationSolarSettingsTable,
	simulationTouTariffSettingsTable,
} from "../db/tables/simulation";
import { userDataTable, userTable } from "../db/tables/user";
import { getCurrentSession } from "../lib/auth";
import { logAction, logError } from "../queries/logs";
import { getOrCreateHintConfig, updateHintConfig } from "../queries/hints";

export async function adminUpdateUserNameAction(userId: string, data: z.infer<typeof accountNameSchema>) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user || !user.isAdmin) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_USER_NAME_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: user ? ErrorTypes.NOT_ADMIN : ErrorTypes.NOT_LOGGED_IN,
						user: user?.id ?? null,
						session: sid,
						targetUser: userId,
					},
				}),
			);
			return {
				success: false,
				message: "Sie sind nicht berechtigt, diese Aktion durchzuführen.",
			};
		}

		const valid = accountNameSchema.safeParse(data);
		if (!valid.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_USER_NAME_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.INVALID_INPUT,
						user: user.id,
						session: sid,
						targetUser: userId,
						data,
					},
				}),
			);
			return {
				success: false,
				message: "Bitte überprüfen Sie Ihre Eingaben.",
			};
		}

		const oldData = await db
			.select({
				firstname: userTable.firstname,
				lastname: userTable.lastname,
			})
			.from(userTable)
			.where(eq(userTable.id, userId))
			.limit(1);

		if (oldData.length === 0) {
			return {
				success: false,
				message: "Benutzer nicht gefunden.",
			};
		}

		await db
			.update(userTable)
			.set({
				firstname: data.firstname,
				lastname: data.lastname,
				username: `${data.firstname} ${data.lastname}`,
			})
			.where(eq(userTable.id, userId));

		revalidatePath(`/admin/users/${userId}`);
		revalidatePath(`/admin/users/${userId}/edit`);

		waitUntil(
			logAction({
				fn: LogActionTypes.ADMIN_UPDATE_USER_NAME_ACTION,
				result: "success",
				details: {
					success: true,
					reason: null,
					user: user.id,
					session: sid,
					targetUser: userId,
					data: {
						old: oldData[0],
						new: {
							firstname: data.firstname,
							lastname: data.lastname,
						},
					},
				},
			}),
		);

		return {
			success: true,
			message: "Name erfolgreich aktualisiert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.ADMIN_UPDATE_USER_NAME_ACTION,
				error: err as unknown as Error,
				details: {
					user: null,
					session: null,
					targetUser: userId,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function adminUpdateUserInfoAction(userId: string, data: z.infer<typeof accountInfoSchema>) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user || !user.isAdmin) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_USER_INFO_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: user ? ErrorTypes.NOT_ADMIN : ErrorTypes.NOT_LOGGED_IN,
						user: user?.id ?? null,
						session: sid,
						targetUser: userId,
					},
				}),
			);
			return {
				success: false,
				message: "Sie sind nicht berechtigt, diese Aktion durchzuführen.",
			};
		}

		const valid = accountInfoSchema.safeParse(data);
		if (!valid.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_USER_INFO_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.INVALID_INPUT,
						user: user.id,
						session: sid,
						targetUser: userId,
						data,
					},
				}),
			);
			return {
				success: false,
				message: "Bitte überprüfen Sie Ihre Eingaben.",
			};
		}

		const oldData = await db
			.select({
				phone: userTable.phone,
				address: userTable.address,
				timezone: userTable.timezone,
			})
			.from(userTable)
			.where(eq(userTable.id, userId))
			.limit(1);

		if (oldData.length === 0) {
			return {
				success: false,
				message: "Benutzer nicht gefunden.",
			};
		}

		await db
			.update(userTable)
			.set({
				phone: data.phone,
				address: data.address,
				timezone: data.timezone,
			})
			.where(eq(userTable.id, userId));

		revalidatePath(`/admin/users/${userId}`);
		revalidatePath(`/admin/users/${userId}/edit`);

		waitUntil(
			logAction({
				fn: LogActionTypes.ADMIN_UPDATE_USER_INFO_ACTION,
				result: "success",
				details: {
					success: true,
					reason: null,
					user: user.id,
					session: sid,
					targetUser: userId,
					data: {
						old: oldData[0],
						new: data,
					},
				},
			}),
		);

		return {
			success: true,
			message: "Kontaktdaten erfolgreich aktualisiert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.ADMIN_UPDATE_USER_INFO_ACTION,
				error: err as unknown as Error,
				details: {
					user: null,
					session: null,
					targetUser: userId,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function adminUpdateHouseholdAction(userId: string, data: z.infer<typeof householdSchema>) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user || !user.isAdmin) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_HOUSEHOLD_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: user ? ErrorTypes.NOT_ADMIN : ErrorTypes.NOT_LOGGED_IN,
						user: user?.id ?? null,
						session: sid,
						targetUser: userId,
					},
				}),
			);
			return {
				success: false,
				message: "Sie sind nicht berechtigt, diese Aktion durchzuführen.",
			};
		}

		const valid = householdSchema.safeParse(data);
		if (!valid.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_HOUSEHOLD_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.INVALID_INPUT,
						user: user.id,
						session: sid,
						targetUser: userId,
						data,
					},
				}),
			);
			return {
				success: false,
				message: "Bitte überprüfen Sie Ihre Eingaben.",
			};
		}

		// Check if user data exists
		const existingData = await db
			.select({
				id: userDataTable.id,
				property: userDataTable.property,
				livingSpace: userDataTable.livingSpace,
				household: userDataTable.household,
			})
			.from(userDataTable)
			.where(eq(userDataTable.userId, userId))
			.limit(1);

		if (existingData.length === 0) {
			// Create new user data entry
			await db.insert(userDataTable).values({
				userId,
				property: data.houseType,
				livingSpace: data.livingSpace,
				household: data.people,
			});
		} else {
			// Update existing entry
			await db
				.update(userDataTable)
				.set({
					property: data.houseType,
					livingSpace: data.livingSpace,
					household: data.people,
				})
				.where(eq(userDataTable.userId, userId));
		}

		revalidatePath(`/admin/users/${userId}`);
		revalidatePath(`/admin/users/${userId}/edit`);

		waitUntil(
			logAction({
				fn: LogActionTypes.ADMIN_UPDATE_HOUSEHOLD_ACTION,
				result: "success",
				details: {
					success: true,
					reason: null,
					user: user.id,
					session: sid,
					targetUser: userId,
					data: {
						old: existingData[0] ?? null,
						new: {
							property: data.houseType,
							livingSpace: data.livingSpace,
							household: data.people,
						},
					},
				},
			}),
		);

		return {
			success: true,
			message: "Haushaltsdaten erfolgreich aktualisiert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.ADMIN_UPDATE_HOUSEHOLD_ACTION,
				error: err as unknown as Error,
				details: {
					user: null,
					session: null,
					targetUser: userId,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function adminUpdateEnergyTariffAction(userId: string, data: z.infer<typeof energyTarfiffSchema>) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user || !user.isAdmin) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_ENERGY_TARIFF_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: user ? ErrorTypes.NOT_ADMIN : ErrorTypes.NOT_LOGGED_IN,
						user: user?.id ?? null,
						session: sid,
						targetUser: userId,
					},
				}),
			);
			return {
				success: false,
				message: "Sie sind nicht berechtigt, diese Aktion durchzuführen.",
			};
		}

		const valid = energyTarfiffSchema.safeParse(data);
		if (!valid.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_ENERGY_TARIFF_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.INVALID_INPUT,
						user: user.id,
						session: sid,
						targetUser: userId,
						data,
					},
				}),
			);
			return {
				success: false,
				message: "Bitte überprüfen Sie Ihre Eingaben.",
			};
		}

		// Check if user data exists
		const existingData = await db
			.select({
				id: userDataTable.id,
				tariff: userDataTable.tariff,
				basePrice: userDataTable.basePrice,
				workingPrice: userDataTable.workingPrice,
				monthlyPayment: userDataTable.monthlyPayment,
			})
			.from(userDataTable)
			.where(eq(userDataTable.userId, userId))
			.limit(1);

		if (existingData.length === 0) {
			// Create new user data entry
			await db.insert(userDataTable).values({
				userId,
				tariff: data.tariffType,
				basePrice: data.basePrice,
				workingPrice: data.workingPrice,
				monthlyPayment: data.monthlyPayment,
			});
		} else {
			// Update existing entry
			await db
				.update(userDataTable)
				.set({
					tariff: data.tariffType,
					basePrice: data.basePrice,
					workingPrice: data.workingPrice,
					monthlyPayment: data.monthlyPayment,
				})
				.where(eq(userDataTable.userId, userId));
		}

		revalidatePath(`/admin/users/${userId}`);
		revalidatePath(`/admin/users/${userId}/edit`);

		waitUntil(
			logAction({
				fn: LogActionTypes.ADMIN_UPDATE_ENERGY_TARIFF_ACTION,
				result: "success",
				details: {
					success: true,
					reason: null,
					user: user.id,
					session: sid,
					targetUser: userId,
					data: {
						old: existingData[0] ?? null,
						new: data,
					},
				},
			}),
		);

		return {
			success: true,
			message: "Energietarif erfolgreich aktualisiert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.ADMIN_UPDATE_ENERGY_TARIFF_ACTION,
				error: err as unknown as Error,
				details: {
					user: null,
					session: null,
					targetUser: userId,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function adminUpdateAccountStatusAction(userId: string, data: z.infer<typeof adminAccountStatusSchema>) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user || !user.isAdmin) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_ACCOUNT_STATUS_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: user ? ErrorTypes.NOT_ADMIN : ErrorTypes.NOT_LOGGED_IN,
						user: user?.id ?? null,
						session: sid,
						targetUser: userId,
					},
				}),
			);
			return {
				success: false,
				message: "Sie sind nicht berechtigt, diese Aktion durchzuführen.",
			};
		}

		const valid = adminAccountStatusSchema.safeParse(data);
		if (!valid.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_ACCOUNT_STATUS_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.INVALID_INPUT,
						user: user.id,
						session: sid,
						targetUser: userId,
						data,
					},
				}),
			);
			return {
				success: false,
				message: "Bitte überprüfen Sie Ihre Eingaben.",
			};
		}

		const oldData = await db
			.select({
				isActive: userTable.isActive,
				isAdmin: userTable.isAdmin,
				isParticipant: userTable.isParticipant,
				isSimulationFree: userTable.isSimulationFree,
			})
			.from(userTable)
			.where(eq(userTable.id, userId))
			.limit(1);

		if (oldData.length === 0) {
			return {
				success: false,
				message: "Benutzer nicht gefunden.",
			};
		}

		await db
			.update(userTable)
			.set({
				isActive: data.isActive,
				isAdmin: data.isAdmin,
				isParticipant: data.isParticipant,
				isSimulationFree: data.isSimulationFree,
			})
			.where(eq(userTable.id, userId));

		revalidatePath(`/admin/users/${userId}`);
		revalidatePath(`/admin/users/${userId}/edit`);

		waitUntil(
			logAction({
				fn: LogActionTypes.ADMIN_UPDATE_ACCOUNT_STATUS_ACTION,
				result: "success",
				details: {
					success: true,
					reason: null,
					user: user.id,
					session: sid,
					targetUser: userId,
					data: {
						old: oldData[0],
						new: data,
					},
				},
			}),
		);

		return {
			success: true,
			message: "Kontostatus erfolgreich aktualisiert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.ADMIN_UPDATE_ACCOUNT_STATUS_ACTION,
				error: err as unknown as Error,
				details: {
					user: null,
					session: null,
					targetUser: userId,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

// ============================================================================
// Admin Simulation Settings Actions
// ============================================================================

interface ActionResult {
	success: boolean;
	message: string;
}

export async function adminUpdateSimulationEvSettingsAction(
	userId: string,
	data: z.infer<typeof evSettingsSchema>,
): Promise<ActionResult> {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user || !user.isAdmin) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_SIMULATION_EV_SETTINGS_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: user ? ErrorTypes.NOT_ADMIN : ErrorTypes.NOT_LOGGED_IN,
						user: user?.id ?? null,
						session: sid,
						targetUser: userId,
					},
				}),
			);
			return {
				success: false,
				message: "Sie sind nicht berechtigt, diese Aktion durchzuführen.",
			};
		}

		const validate = evSettingsSchema.safeParse(data);
		if (!validate.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_SIMULATION_EV_SETTINGS_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.INVALID_INPUT,
						user: user.id,
						session: sid,
						targetUser: userId,
						data,
					},
				}),
			);
			return {
				success: false,
				message: "Die Daten sind nicht gültig.",
			};
		}

		const payload = validate.data;
		const existing = await db
			.select()
			.from(simulationEvSettingsTable)
			.where(eq(simulationEvSettingsTable.userId, userId))
			.limit(1);

		await db
			.insert(simulationEvSettingsTable)
			.values({
				userId,
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

		revalidatePath(`/admin/users/${userId}`);
		revalidatePath(`/admin/users/${userId}/edit`);

		waitUntil(
			logAction({
				fn: LogActionTypes.ADMIN_UPDATE_SIMULATION_EV_SETTINGS_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					reason: null,
					success: true,
					targetUser: userId,
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
				fn: LogActionTypes.ADMIN_UPDATE_SIMULATION_EV_SETTINGS_ACTION,
				error: err as Error,
				details: {
					user: null,
					session: null,
					targetUser: userId,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function adminUpdateSimulationSolarSettingsAction(
	userId: string,
	data: z.infer<typeof solarSettingsSchema>,
): Promise<ActionResult> {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user || !user.isAdmin) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_SIMULATION_SOLAR_SETTINGS_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: user ? ErrorTypes.NOT_ADMIN : ErrorTypes.NOT_LOGGED_IN,
						user: user?.id ?? null,
						session: sid,
						targetUser: userId,
					},
				}),
			);
			return {
				success: false,
				message: "Sie sind nicht berechtigt, diese Aktion durchzuführen.",
			};
		}

		const validate = solarSettingsSchema.safeParse(data);
		if (!validate.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_SIMULATION_SOLAR_SETTINGS_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.INVALID_INPUT,
						user: user.id,
						session: sid,
						targetUser: userId,
						data,
					},
				}),
			);
			return {
				success: false,
				message: "Die Daten sind nicht gültig.",
			};
		}

		const payload = validate.data;
		const inverterPower = payload.inverterPower === "" ? null : payload.inverterPower;
		const sunHoursPerDay = payload.sunHoursPerDay ?? null;
		const existing = await db
			.select()
			.from(simulationSolarSettingsTable)
			.where(eq(simulationSolarSettingsTable.userId, userId))
			.limit(1);

		await db
			.insert(simulationSolarSettingsTable)
			.values({
				userId,
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

		revalidatePath(`/admin/users/${userId}`);
		revalidatePath(`/admin/users/${userId}/edit`);

		waitUntil(
			logAction({
				fn: LogActionTypes.ADMIN_UPDATE_SIMULATION_SOLAR_SETTINGS_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					reason: null,
					success: true,
					targetUser: userId,
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
				fn: LogActionTypes.ADMIN_UPDATE_SIMULATION_SOLAR_SETTINGS_ACTION,
				error: err as Error,
				details: {
					user: null,
					session: null,
					targetUser: userId,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function adminUpdateSimulationHeatPumpSettingsAction(
	userId: string,
	data: z.infer<typeof heatPumpSettingsSchema>,
): Promise<ActionResult> {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user || !user.isAdmin) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_SIMULATION_HEAT_PUMP_SETTINGS_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: user ? ErrorTypes.NOT_ADMIN : ErrorTypes.NOT_LOGGED_IN,
						user: user?.id ?? null,
						session: sid,
						targetUser: userId,
					},
				}),
			);
			return {
				success: false,
				message: "Sie sind nicht berechtigt, diese Aktion durchzuführen.",
			};
		}

		const validate = heatPumpSettingsSchema.safeParse(data);
		if (!validate.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_SIMULATION_HEAT_PUMP_SETTINGS_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.INVALID_INPUT,
						user: user.id,
						session: sid,
						targetUser: userId,
						data,
					},
				}),
			);
			return {
				success: false,
				message: "Die Daten sind nicht gültig.",
			};
		}

		const payload = validate.data;
		const existing = await db
			.select()
			.from(simulationHeatPumpSettingsTable)
			.where(eq(simulationHeatPumpSettingsTable.userId, userId))
			.limit(1);

		await db
			.insert(simulationHeatPumpSettingsTable)
			.values({
				userId,
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

		revalidatePath(`/admin/users/${userId}`);
		revalidatePath(`/admin/users/${userId}/edit`);

		waitUntil(
			logAction({
				fn: LogActionTypes.ADMIN_UPDATE_SIMULATION_HEAT_PUMP_SETTINGS_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					reason: null,
					success: true,
					targetUser: userId,
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
				fn: LogActionTypes.ADMIN_UPDATE_SIMULATION_HEAT_PUMP_SETTINGS_ACTION,
				error: err as Error,
				details: {
					user: null,
					session: null,
					targetUser: userId,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function adminUpdateSimulationBatterySettingsAction(
	userId: string,
	data: z.infer<typeof batterySettingsSchema>,
): Promise<ActionResult> {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user || !user.isAdmin) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_SIMULATION_BATTERY_SETTINGS_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: user ? ErrorTypes.NOT_ADMIN : ErrorTypes.NOT_LOGGED_IN,
						user: user?.id ?? null,
						session: sid,
						targetUser: userId,
					},
				}),
			);
			return {
				success: false,
				message: "Sie sind nicht berechtigt, diese Aktion durchzuführen.",
			};
		}

		const validate = batterySettingsSchema.safeParse(data);
		if (!validate.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_SIMULATION_BATTERY_SETTINGS_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.INVALID_INPUT,
						user: user.id,
						session: sid,
						targetUser: userId,
						data,
					},
				}),
			);
			return {
				success: false,
				message: "Die Daten sind nicht gültig.",
			};
		}

		const payload = validate.data;
		const existing = await db
			.select()
			.from(simulationBatterySettingsTable)
			.where(eq(simulationBatterySettingsTable.userId, userId))
			.limit(1);

		await db
			.insert(simulationBatterySettingsTable)
			.values({
				userId,
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

		revalidatePath(`/admin/users/${userId}`);
		revalidatePath(`/admin/users/${userId}/edit`);

		waitUntil(
			logAction({
				fn: LogActionTypes.ADMIN_UPDATE_SIMULATION_BATTERY_SETTINGS_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					reason: null,
					success: true,
					targetUser: userId,
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
				fn: LogActionTypes.ADMIN_UPDATE_SIMULATION_BATTERY_SETTINGS_ACTION,
				error: err as Error,
				details: {
					user: null,
					session: null,
					targetUser: userId,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function adminUpdateSimulationTouTariffSettingsAction(
	userId: string,
	data: z.infer<typeof touTariffSchema>,
): Promise<ActionResult> {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user || !user.isAdmin) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_SIMULATION_TOU_SETTINGS_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: user ? ErrorTypes.NOT_ADMIN : ErrorTypes.NOT_LOGGED_IN,
						user: user?.id ?? null,
						session: sid,
						targetUser: userId,
					},
				}),
			);
			return {
				success: false,
				message: "Sie sind nicht berechtigt, diese Aktion durchzuführen.",
			};
		}

		const validate = touTariffSchema.safeParse(data);
		if (!validate.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_SIMULATION_TOU_SETTINGS_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.INVALID_INPUT,
						user: user.id,
						session: sid,
						targetUser: userId,
						data,
					},
				}),
			);
			return {
				success: false,
				message: "Die Daten sind nicht gültig.",
			};
		}

		const payload = validate.data;
		const existing = await db
			.select()
			.from(simulationTouTariffSettingsTable)
			.where(eq(simulationTouTariffSettingsTable.userId, userId))
			.limit(1);

		await db
			.insert(simulationTouTariffSettingsTable)
			.values({
				userId,
				basePrice: payload.basePrice,
				standardPrice: payload.standardPrice,
				zones: payload.zones ?? [],
				weekdayZones: payload.weekdayZones,
			})
			.onConflictDoUpdate({
				target: simulationTouTariffSettingsTable.userId,
				set: {
					basePrice: payload.basePrice,
					standardPrice: payload.standardPrice,
					zones: payload.zones ?? [],
					weekdayZones: payload.weekdayZones,
					updatedAt: sql`now()`,
				},
			});

		revalidatePath(`/admin/users/${userId}`);
		revalidatePath(`/admin/users/${userId}/edit`);

		waitUntil(
			logAction({
				fn: LogActionTypes.ADMIN_UPDATE_SIMULATION_TOU_SETTINGS_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					reason: null,
					success: true,
					targetUser: userId,
					data: {
						old: existing[0] ?? null,
						new: payload,
					},
				},
			}),
		);

		return {
			success: true,
			message: "TOU-Tarif-Simulation gespeichert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.ADMIN_UPDATE_SIMULATION_TOU_SETTINGS_ACTION,
				error: err as Error,
				details: {
					user: null,
					session: null,
					targetUser: userId,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function adminToggleSimulationEnabledAction(
	userId: string,
	simulationType: SimulationTypeValue,
	enabled: boolean,
): Promise<ActionResult> {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user || !user.isAdmin) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_TOGGLE_SIMULATION_ENABLED_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: user ? ErrorTypes.NOT_ADMIN : ErrorTypes.NOT_LOGGED_IN,
						user: user?.id ?? null,
						session: sid,
						targetUser: userId,
					},
				}),
			);
			return {
				success: false,
				message: "Sie sind nicht berechtigt, diese Aktion durchzuführen.",
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
			.where(eq(table.userId, userId));

		revalidatePath(`/admin/users/${userId}`);
		revalidatePath(`/admin/users/${userId}/edit`);

		waitUntil(
			logAction({
				fn: LogActionTypes.ADMIN_TOGGLE_SIMULATION_ENABLED_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					reason: null,
					success: true,
					targetUser: userId,
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
				fn: LogActionTypes.ADMIN_TOGGLE_SIMULATION_ENABLED_ACTION,
				error: err as Error,
				details: {
					user: null,
					session: null,
					targetUser: userId,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function adminCreateUserAction(data: z.infer<typeof adminCreateUserSchema>) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user || !user.isAdmin) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_CREATE_USER_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: user ? ErrorTypes.NOT_ADMIN : ErrorTypes.NOT_LOGGED_IN,
						user: user?.id ?? null,
						session: sid,
					},
				}),
			);
			return {
				success: false,
				message: "Sie sind nicht berechtigt, diese Aktion durchzuführen.",
			};
		}

		const valid = adminCreateUserSchema.safeParse(data);
		if (!valid.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_CREATE_USER_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.INVALID_INPUT,
						user: user.id,
						session: sid,
						data: { ...data, password: "[REDACTED]", passwordRepeat: "[REDACTED]" },
					},
				}),
			);
			return {
				success: false,
				message: "Bitte überprüfen Sie Ihre Eingaben.",
			};
		}

		if (data.mail.length >= 256) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_CREATE_USER_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.STRING_TOO_LONG,
						user: user.id,
						session: sid,
					},
				}),
			);
			return {
				success: false,
				message: "E-Mail muss unter dem Zeichenlimit von 256 Zeichen liegen.",
			};
		}

		if (data.password.length >= 256) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_CREATE_USER_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.STRING_TOO_LONG,
						user: user.id,
						session: sid,
					},
				}),
			);
			return {
				success: false,
				message: "Passwort muss unter dem Zeichenlimit von 256 Zeichen liegen.",
			};
		}

		// Check if email is already in use
		const existingUsers = await db
			.select({ id: userTable.id })
			.from(userTable)
			.where(eq(userTable.email, data.mail))
			.limit(1);

		if (existingUsers.length > 0) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_CREATE_USER_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.EMAIL_USED,
						user: user.id,
						session: sid,
						email: data.mail,
					},
				}),
			);
			return {
				success: false,
				message: "E-Mail wird bereits verwendet.",
			};
		}

		const userId = genID(30);
		const passwordHash = await hash(data.password);

		await db.transaction(async (trx) => {
			await trx.insert(userTable).values({
				id: userId,
				firstname: data.firstname,
				lastname: data.lastname,
				username: `${data.firstname} ${data.lastname}`,
				email: data.mail,
				password: passwordHash,
				address: data.address,
				phone: null,
				isAdmin: data.isAdmin,
				isParticipant: data.isParticipant,
				isActive: false,
			});
			await trx.insert(userDataTable).values({
				userId,
				electricityMeterNumber: null,
				electricityMeterType: null,
				electricityMeterImgUrl: null,
				installationComment: null,
			});
			await trx.insert(reportConfigTable).values({
				userId,
			});
		});

		revalidatePath("/admin/users");

		waitUntil(
			logAction({
				fn: LogActionTypes.ADMIN_CREATE_USER_ACTION,
				result: "success",
				details: {
					success: true,
					reason: null,
					user: user.id,
					session: sid,
					createdUser: userId,
					data: {
						email: data.mail,
						firstname: data.firstname,
						lastname: data.lastname,
						isAdmin: data.isAdmin,
						isParticipant: data.isParticipant,
					},
				},
			}),
		);

		return {
			success: true,
			message: "Nutzer erfolgreich erstellt.",
			path: "/admin/users",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.ADMIN_CREATE_USER_ACTION,
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

export async function adminUpdateHintConfigAction(userId: string, data: z.infer<typeof adminHintConfigSchema>) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user || !user.isAdmin) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_HINT_CONFIG_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: user ? ErrorTypes.NOT_ADMIN : ErrorTypes.NOT_LOGGED_IN,
						user: user?.id ?? null,
						session: sid,
						targetUser: userId,
					},
				}),
			);
			return {
				success: false,
				message: "Sie sind nicht berechtigt, diese Aktion durchzuführen.",
			};
		}

		const valid = adminHintConfigSchema.safeParse(data);
		if (!valid.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_HINT_CONFIG_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.INVALID_INPUT,
						user: user.id,
						session: sid,
						targetUser: userId,
						data,
					},
				}),
			);
			return {
				success: false,
				message: "Bitte überprüfen Sie Ihre Eingaben.",
			};
		}

		// Get or create hint config
		const existingConfig = await getOrCreateHintConfig(userId);
		const stageChanged = existingConfig.stage !== data.stage;

		// Prepare update data
		const updateData: Parameters<typeof updateHintConfig>[1] = {
			stage: data.stage as "simple" | "intermediate" | "expert",
			hintsEnabled: data.hintsEnabled,
		};

		// If stage changed, reset progress
		if (stageChanged) {
			updateData.hintsDaysSeenInStage = 0;
			updateData.stageStartedAt = new Date();
		}

		await updateHintConfig(userId, updateData);

		revalidatePath(`/admin/users/${userId}`);
		revalidatePath(`/admin/users/${userId}/edit`);

		waitUntil(
			logAction({
				fn: LogActionTypes.ADMIN_UPDATE_HINT_CONFIG_ACTION,
				result: "success",
				details: {
					success: true,
					reason: null,
					user: user.id,
					session: sid,
					targetUser: userId,
					data: {
						old: {
							stage: existingConfig.stage,
							hintsEnabled: existingConfig.hintsEnabled,
						},
						new: data,
						stageChanged,
					},
				},
			}),
		);

		return {
			success: true,
			message: stageChanged
				? "Hinweis-Konfiguration aktualisiert. Fortschritt wurde zurückgesetzt."
				: "Hinweis-Konfiguration erfolgreich aktualisiert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.ADMIN_UPDATE_HINT_CONFIG_ACTION,
				error: err as Error,
				details: {
					user: null,
					session: null,
					targetUser: userId,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}
