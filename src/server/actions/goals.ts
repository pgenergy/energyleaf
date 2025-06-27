"use server";

import { ErrorTypes, LogActionTypes } from "@/lib/log-types";
import { energyGoalSchema } from "@/lib/schemas/profile-schema";
import { waitUntil } from "@vercel/functions";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "../db";
import { userDataTable } from "../db/tables/user";
import { getCurrentSession } from "../lib/auth";
import { getDemoUserData, updateDemoUserData } from "../lib/demo";
import { logAction, logError } from "../queries/logs";

export async function updateEnergyGoalAction(data: z.infer<typeof energyGoalSchema>) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_ENERGY_GOAL_ACTION,
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
				message: "Bitte melden Sie sich an.",
			};
		}

		const valid = energyGoalSchema.safeParse(data);
		if (!valid.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_ENERGY_GOAL_ACTION,
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
				message: "Bitte überprüfen Sie Ihre Eingaben.",
			};
		}

		if (user.id === "demo") {
			const userData = await getDemoUserData();
			const workingPrice = userData.workingPrice;
			const basePrice = userData.basePrice;
			if (!workingPrice || !basePrice) {
				return {
					success: false,
					message: "Es wurde kein Arbeitspreis/Basispreis angegeben.",
				};
			}

			const consumption = (data.cost - basePrice) / workingPrice;
			const roundedConsumption = Math.round(consumption * 100) / 100;

			await updateDemoUserData({
				consumptionGoal: roundedConsumption,
			});
			revalidatePath("/settings/goals");
			return {
				success: true,
				message: "Ziele erfolgreich gespeichert.",
				payload: roundedConsumption,
			};
		}

		const userData = await db
			.select({
				workingPrice: userDataTable.workingPrice,
				basePrice: userDataTable.basePrice,
				goal: userDataTable.consumptionGoal,
			})
			.from(userDataTable)
			.where(eq(userDataTable.userId, user.id))
			.limit(1);

		if (userData.length === 0) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_ENERGY_GOAL_ACTION,
					result: "failed",
					details: {
						success: false,
						user: user.id,
						session: sid,
						reason: ErrorTypes.USER_NOT_FOUND,
					},
				})
			);

			return {
				success: false,
				message: "Ein unerwarteter Fehler ist aufgetreten.",
			};
		}

		if (!userData[0].workingPrice || !userData[0].basePrice) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_ENERGY_GOAL_ACTION,
					result: "failed",
					details: {
						success: false,
						user: user.id,
						session: sid,
						reason: ErrorTypes.NO_TARRIF_DATA,
					},
				})
			);

			return {
				success: false,
				message: "Es wurde kein Arbeitspreis/Basispreis angegeben.",
			};
		}

		const basePrice = userData[0].basePrice;
		const workingPrice = userData[0].workingPrice;

		if (basePrice >= data.cost) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_ENERGY_GOAL_ACTION,
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
				message: "Der Basispreis ist höher als Ihr angegebener Preis.",
			};
		}

		const consumption = (data.cost - basePrice) / workingPrice;
		const roundedConsumption = Math.round(consumption * 100) / 100;
		await db
			.update(userDataTable)
			.set({ consumptionGoal: roundedConsumption })
			.where(eq(userDataTable.userId, user.id));
		revalidatePath("/settings/goals");
		waitUntil(
			logAction({
				fn: LogActionTypes.UPDATE_ENERGY_GOAL_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					success: true,
					reason: null,
					data: {
						new: {
							consumptionGoal: roundedConsumption,
						},
						old: {
							consumptionGoal: userData[0].goal,
						},
					},
				},
			})
		);
		return {
			success: true,
			message: "Ziele erfolgreich gespeichert.",
			payload: roundedConsumption,
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.UPDATE_ENERGY_GOAL_ACTION,
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
