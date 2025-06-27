"use server";

import { ErrorTypes, LogActionTypes } from "@/lib/log-types";
import { energyTarfiffSchema, householdSchema } from "@/lib/schemas/profile-schema";
import { waitUntil } from "@vercel/functions";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
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
				})
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
				})
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
			})
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
			})
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function updateEnergyTariffAction(data: z.infer<typeof energyTarfiffSchema>) {
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
				})
			);
			return {
				success: false,
				message: "Sie müssen angemeldet sein, um Ihren Stromtarif zu bearbeiten.",
			};
		}

		const validate = energyTarfiffSchema.safeParse(data);
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
				})
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
			})
			.from(userDataTable)
			.where(eq(userDataTable.userId, user.id))
			.limit(1);
		await db
			.update(userDataTable)
			.set({
				tariff: data.tariffType,
				basePrice: data.basePrice,
				workingPrice: data.workingPrice,
				monthlyPayment: data.monthlyPayment,
			})
			.where(eq(userDataTable.userId, user.id));
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
			})
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
			})
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}
