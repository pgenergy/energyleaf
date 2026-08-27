"use server";

import { ErrorTypes, LogActionTypes } from "@/lib/log-types";
import type { TariffTypeValue } from "@/lib/enums";
import { energyTariffSchema, householdSchema } from "@/lib/schemas/profile-schema";
import { waitUntil } from "@vercel/functions";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { z } from "zod";
import { db } from "../db";
import { userDataTable } from "../db/tables/user";
import { getCurrentSession } from "../lib/auth";
import { updateDemoUserData } from "../lib/demo";
import { logAction, logError } from "../queries/logs";

export async function updateHouseholdAction(data: z.infer<typeof householdSchema>) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_HOUSEHOLD_ACTION,
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
				message: "Sie müssen angemeldet sein, um Ihre Haushalt zu bearbeiten.",
			};
		}

		const validate = householdSchema.safeParse(data);
		if (!validate.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_HOUSEHOLD_ACTION,
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
			await updateDemoUserData({
				property: data.houseType,
				livingSpace: data.livingSpace,
				household: data.people,
			});
			revalidatePath("/settings");
			return {
				success: true,
				message: "Haushalt erfolgreich aktualisiert.",
			};
		}

		const oldData = await db
			.select({
				property: userDataTable.property,
				livingSpace: userDataTable.livingSpace,
				household: userDataTable.household,
			})
			.from(userDataTable)
			.where(eq(userDataTable.userId, user.id))
			.limit(1);
		await db
			.update(userDataTable)
			.set({
				property: data.houseType,
				livingSpace: data.livingSpace,
				household: data.people,
			})
			.where(eq(userDataTable.userId, user.id));
		revalidatePath("/settings");
		waitUntil(
			logAction({
				fn: LogActionTypes.UPDATE_HOUSEHOLD_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					success: true,
					reason: null,
					data: {
						old: {
							property: oldData[0].property,
							livingSpace: oldData[0].livingSpace,
							household: oldData[0].household,
						},
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
			message: "Haushalt erfolgreich aktualisiert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.UPDATE_HOUSEHOLD_ACTION,
				error: err as unknown as Error,
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

export async function updateEnergyTariffAction(data: z.infer<typeof energyTariffSchema>) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_ENERGY_TARIFF_ACTION,
					result: "failed",
					details: {
						success: false,
						user: null,
						session: sid,
						reason: ErrorTypes.NOT_LOGGED_IN,
					},
				}),
			);
			return {
				success: false,
				message: "Sie müssen angemeldet sein, um Ihren Stromtarif zu bearbeiten.",
			};
		}

		const validate = energyTariffSchema.safeParse(data);
		if (!validate.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_ENERGY_TARIFF_ACTION,
					result: "failed",
					details: {
						success: false,
						user: user.id,
						session: sid,
						reason: ErrorTypes.INVALID_INPUT,
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
			await updateDemoUserData({
				tariff: data.tariffType,
				basePrice: data.basePrice,
				workingPrice: data.workingPrice,
				monthlyPayment: data.monthlyPayment,
			});
			revalidatePath("/settings");
			return {
				success: true,
				message: "Stromtarif erfolgreich aktualisiert.",
			};
		}

		const oldData = await db
			.select({
				tariff: userDataTable.tariff,
				basePrice: userDataTable.basePrice,
				workingPrice: userDataTable.workingPrice,
				monthlyPayment: userDataTable.monthlyPayment,
				consumptionGoal: userDataTable.consumptionGoal,
			})
			.from(userDataTable)
			.where(eq(userDataTable.userId, user.id))
			.limit(1);

		// Recalculate consumptionGoal to keep the cost goal stable
		let consumptionGoalUpdate: number | null = null;
		if (oldData[0]?.consumptionGoal != null && oldData[0].workingPrice && oldData[0].basePrice) {
			const oldCost = oldData[0].consumptionGoal * oldData[0].workingPrice + oldData[0].basePrice;
			const newBasePrice = data.basePrice;
			const newWorkingPrice = data.workingPrice;
			if (newWorkingPrice > 0 && oldCost > 0) {
				consumptionGoalUpdate = Math.round(((oldCost - newBasePrice) / newWorkingPrice) * 100) / 100;
			}
		}

		const updateFields: Record<string, number | TariffTypeValue | undefined> = {
			tariff: data.tariffType,
			basePrice: data.basePrice,
			workingPrice: data.workingPrice,
			monthlyPayment: data.monthlyPayment,
		};

		if (consumptionGoalUpdate !== null) {
			updateFields.consumptionGoal = consumptionGoalUpdate;
		}

		await db.update(userDataTable).set(updateFields).where(eq(userDataTable.userId, user.id));
		revalidatePath("/settings");
		waitUntil(
			logAction({
				fn: LogActionTypes.UPDATE_ENERGY_TARIFF_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					reason: null,
					success: true,
					data: {
						old: {
							...oldData[0],
						},
						new: {
							...data,
						},
					},
				},
			}),
		);
		return {
			success: true,
			message: "Stromtarif erfolgreich aktualisiert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.UPDATE_ENERGY_TARIFF_ACTION,
				error: err as unknown as Error,
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

export async function toggleSolarFeedInVisualizationAction(enabled: boolean) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.TOGGLE_SOLAR_FEED_IN_VISUALIZATION_ACTION,
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
				message: "Sie mssen angemeldet sein.",
			};
		}

		if (user.id === "demo") {
			await updateDemoUserData({
				showSolarFeedIn: enabled,
			});
			revalidatePath("/settings");
			revalidatePath("/energy");
			revalidatePath("/dashboard");
			return {
				success: true,
				message: "Darstellung erfolgreich aktualisiert.",
			};
		}

		const oldData = await db
			.select({
				showSolarFeedIn: userDataTable.showSolarFeedIn,
			})
			.from(userDataTable)
			.where(eq(userDataTable.userId, user.id))
			.limit(1);
		await db.update(userDataTable).set({ showSolarFeedIn: enabled }).where(eq(userDataTable.userId, user.id));
		revalidatePath("/settings");
		revalidatePath("/energy");
		revalidatePath("/dashboard");
		waitUntil(
			logAction({
				fn: LogActionTypes.TOGGLE_SOLAR_FEED_IN_VISUALIZATION_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					success: true,
					reason: null,
					data: {
						old: oldData[0]?.showSolarFeedIn ?? false,
						new: enabled,
					},
				},
			}),
		);
		return {
			success: true,
			message: "Darstellung erfolgreich aktualisiert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.TOGGLE_SOLAR_FEED_IN_VISUALIZATION_ACTION,
				error: err as unknown as Error,
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
