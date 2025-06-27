"use server";

import { ErrorTypes, LogActionTypes } from "@/lib/log-types";
import { addDeviceToPeakSchema } from "@/lib/schemas/peak-schema";
import { waitUntil } from "@vercel/functions";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "../db";
import { deviceTable, deviceToPeakTable } from "../db/tables/device";
import { energyDataSequenceTable } from "../db/tables/sensor";
import { getCurrentSession } from "../lib/auth";
import { updatePowerOfDevices } from "../lib/devices";
import { calculateAverageWeeklyUsageTimeInHours } from "../lib/peaks";
import { logAction, logError } from "../queries/logs";

export async function updateDevicesToPeakAction(data: z.infer<typeof addDeviceToPeakSchema>, peakId: string) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADD_DEVICE_TO_PEAK_ACTION,
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

		const valid = addDeviceToPeakSchema.safeParse(data);
		if (!valid.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADD_DEVICE_TO_PEAK_ACTION,
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

		const deviceIds = data.devices.map((d) => d.id);
		await db.transaction(async (trx) => {
			await trx.delete(deviceToPeakTable).where(eq(deviceToPeakTable.energyDataSequenceId, peakId));

			for (const deviceId of deviceIds) {
				await trx.insert(deviceToPeakTable).values({
					deviceId: deviceId,
					energyDataSequenceId: peakId,
				});
				const newWeeklyUsageEstimation = await calculateAverageWeeklyUsageTimeInHours(deviceId);
				await trx
					.update(deviceTable)
					.set({ weeklyUsageEstimation: newWeeklyUsageEstimation })
					.where(eq(deviceTable.id, deviceId));
			}
		});
		await updatePowerOfDevices(user.id);
		revalidatePath("/peaks");
		revalidatePath("/devices");
		waitUntil(
			logAction({
				fn: LogActionTypes.ADD_DEVICE_TO_PEAK_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					success: true,
					reason: null,
					data: {
						...data,
						peakId,
					},
				},
			})
		);
		return {
			success: true,
			message: "Geräte erfolgreich zugewiesen.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.ADD_DEVICE_TO_PEAK_ACTION,
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

export async function deletePeakAction(peakId: string) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.DELETE_PEAK_ACTION,
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

		// Get devices associated with this peak before deletion for logging
		const devicesToRemove = await db
			.select()
			.from(deviceToPeakTable)
			.where(eq(deviceToPeakTable.energyDataSequenceId, peakId));

		await db.transaction(async (trx) => {
			await trx.delete(deviceToPeakTable).where(eq(deviceToPeakTable.energyDataSequenceId, peakId));
			await trx.delete(energyDataSequenceTable).where(eq(energyDataSequenceTable.id, peakId));

			// Recalculate usage estimations for affected devices
			for (const deviceAssoc of devicesToRemove) {
				const newWeeklyUsageEstimation = await calculateAverageWeeklyUsageTimeInHours(deviceAssoc.deviceId);
				await trx
					.update(deviceTable)
					.set({ weeklyUsageEstimation: newWeeklyUsageEstimation })
					.where(eq(deviceTable.id, deviceAssoc.deviceId));
			}
		});

		// Update power estimations
		await updatePowerOfDevices(user.id);

		revalidatePath("/peaks");
		revalidatePath("/devices");

		waitUntil(
			logAction({
				fn: LogActionTypes.DELETE_PEAK_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					success: true,
					reason: null,
					data: {
						peakId,
						affectedDevices: devicesToRemove.map((d) => d.deviceId),
					},
				},
			})
		);

		return {
			success: true,
			message: "Spitze erfolgreich gelöscht.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.DELETE_PEAK_ACTION,
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
