"use server";

import { waitUntil } from "@vercel/functions";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { z } from "zod";
import { ErrorTypes, LogActionTypes } from "@/lib/log-types";
import { deviceSchema } from "@/lib/schemas/device-schema";
import { db } from "../db";
import { type Device, deviceTable } from "../db/tables/device";
import { getCurrentSession } from "../lib/auth";
import { addDemoDevice, deleteDemoDevice, updateDemoDevice } from "../lib/demo";
import { logAction, logError } from "../queries/logs";

export async function createDeviceAction(data: z.infer<typeof deviceSchema>) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.CREATE_DEVICE_ACTION,
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
				message: "Bitte melden Sie sich an.",
			};
		}

		const valid = deviceSchema.safeParse(data);
		if (!valid.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.CREATE_DEVICE_ACTION,
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
				message: "Bitte überprüfen Sie Ihre Eingaben.",
			};
		}

		if (user.id === "demo") {
			const newDevices = {
				id: "device_1",
				name: data.name,
				created: new Date(),
				category: data.category,
				power: data.power ? data.power : null,
				isPowerEstimated: !data.power,
				userId: user.id,
				timestamp: new Date(),
				weeklyUsageEstimation: null,
			} satisfies Device;
			await addDemoDevice(newDevices);
			revalidatePath("/devices");
			revalidatePath("/peaks/[id]/edit");
			return {
				success: true,
				message: "Gerät erfolgreich erstellt.",
			};
		}

		await db.insert(deviceTable).values({
			name: data.name,
			category: data.category,
			power: data.power ? data.power : null,
			isPowerEstimated: !data.power,
			userId: user.id,
		});
		revalidatePath("/devices");
		revalidatePath("/peaks/[id]/edit");
		waitUntil(
			logAction({
				fn: LogActionTypes.CREATE_DEVICE_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					success: true,
					reason: null,
					data,
				},
			}),
		);
		return {
			success: true,
			message: "Gerät erfolgreich erstellt.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.CREATE_DEVICE_ACTION,
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

export async function updateDeviceAction(id: string, data: z.infer<typeof deviceSchema>) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_DEVICE_ACTION,
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
				message: "Bitte melden Sie sich an.",
			};
		}

		const valid = deviceSchema.safeParse(data);
		if (!valid.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_DEVICE_ACTION,
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
				message: "Bitte überprüfen Sie Ihre Eingaben.",
			};
		}
		if (user.id === "demo") {
			const newDevice = {
				id: "",
				created: new Date(),
				name: data.name,
				category: data.category,
				power: data.power ? data.power : null,
				isPowerEstimated: !data.power,
				userId: user.id,
				timestamp: new Date(),
				weeklyUsageEstimation: null,
			} satisfies Device;
			await updateDemoDevice(id, newDevice);
			revalidatePath("/devices");
			revalidatePath("/peaks/[id]/edit");
			return {
				success: true,
				message: "Gerät erfolgreich gespeichert.",
			};
		}

		const oldDevice = await db.select().from(deviceTable).where(eq(deviceTable.id, id)).limit(1);
		await db
			.update(deviceTable)
			.set({
				name: data.name,
				category: data.category,
				power: data.power ? data.power : null,
				isPowerEstimated: !data.power,
			})
			.where(eq(deviceTable.id, id));
		revalidatePath("/devices");
		revalidatePath("/peaks/[id]/edit");
		waitUntil(
			logAction({
				fn: LogActionTypes.UPDATE_DEVICE_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					success: true,
					reason: null,
					data: {
						old: {
							id: oldDevice[0].id,
							name: oldDevice[0].name,
							category: oldDevice[0].category,
							power: oldDevice[0].power,
						},
						new: {
							id: id,
							name: data.name,
							category: data.category,
							power: data.power,
						},
					},
				},
			}),
		);
		return {
			success: true,
			message: "Gerät erfolgreich gespeichert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.UPDATE_DEVICE_ACTION,
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
export async function deleteDeviceAction(id: string) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.DELETE_DEVICE_ACTION,
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
				message: "Bitte melden Sie sich an.",
			};
		}

		if (user.id === "demo") {
			await deleteDemoDevice(id);
			revalidatePath("/devices");
			revalidatePath("/peaks/[id]/edit");
			return {
				success: true,
				message: "Gerät erfolgreich gelöscht.",
			};
		}

		const deviceToDelete = await db.select().from(deviceTable).where(eq(deviceTable.id, id)).limit(1);
		if (!deviceToDelete || deviceToDelete.length === 0) {
			waitUntil(
				logAction({
					fn: LogActionTypes.DELETE_DEVICE_ACTION,
					result: "failed",
					details: {
						success: false,
						user: user.id,
						session: sid,
						reason: ErrorTypes.NOT_FOUND,
						data: { id },
					},
				}),
			);
			return {
				success: false,
				message: "Gerät wurde nicht gefunden.",
			};
		}

		await db.delete(deviceTable).where(eq(deviceTable.id, id));
		revalidatePath("/devices");
		revalidatePath("/peaks/[id]/edit");
		waitUntil(
			logAction({
				fn: LogActionTypes.DELETE_DEVICE_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					success: true,
					reason: null,
					data: {
						...deviceToDelete[0],
					},
				},
			}),
		);
		return {
			success: true,
			message: "Gerät erfolgreich gelöscht.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.DELETE_DEVICE_ACTION,
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
