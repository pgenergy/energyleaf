"use server";

import { ErrorTypes, LogActionTypes } from "@/lib/log-types";
import { accountInfoSchema, accountNameSchema, deleteAccountSchema } from "@/lib/schemas/profile-schema";
import { genID } from "@/lib/utils";
import { verify } from "@node-rs/argon2";
import { waitUntil } from "@vercel/functions";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "../db";
import { sensorHistoryTable, sensorTable } from "../db/tables/sensor";
import { userTable } from "../db/tables/user";
import { deleteSessionTokenCookie, getCurrentSession, invalidateSession } from "../lib/auth";
import { logAction, logError } from "../queries/logs";

export async function deleteAccountAction(data: z.infer<typeof deleteAccountSchema>) {
	try {
		const { session, user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user || !session) {
			waitUntil(
				logAction({
					fn: LogActionTypes.DELETE_ACCOUNT_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.NOT_LOGGED_IN,
						user: null,
						session: null,
					},
				})
			);
			return {
				success: false,
				message: "Bitte melden Sie sich an.",
			};
		}

		const valid = deleteAccountSchema.safeParse(data);
		if (!valid.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.DELETE_ACCOUNT_ACTION,
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
				message: "Bitte überprüfen Sie Ihre Eingaben.",
			};
		}

		if (user.id === "demo") {
			return {
				success: false,
				message: "Demo Account kann nicht gelöscht werden.",
			};
		}

		const userInfo = await db.select().from(userTable).where(eq(userTable.id, user.id)).limit(1);
		if (userInfo.length === 0) {
			waitUntil(
				logAction({
					fn: LogActionTypes.DELETE_ACCOUNT_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.USER_NOT_FOUND,
						user: user.id,
						session: sid,
					},
				})
			);
			return {
				success: false,
				message: "Es ist ein unerwarteter Fehler aufgetreten.",
			};
		}

		const check = await verify(userInfo[0].password, data.password);
		if (!check) {
			waitUntil(
				logAction({
					fn: LogActionTypes.DELETE_ACCOUNT_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.WRONG_PASSWORD,
						user: user.id,
						session: sid,
					},
				})
			);
			return {
				success: false,
				message: "Das Passwort ist nicht korrekt.",
			};
		}

		await db.transaction(async (trx) => {
			const firstname = genID(6);
			const lastname = genID(6);
			const username = genID(6);
			const email = `${firstname}.${lastname}@energyleaf.de`;
			await trx
				.update(userTable)
				.set({
					deleted: true,
					firstname,
					lastname,
					username,
					email,
					address: "",
					phone: "",
				})
				.where(eq(userTable.id, user.id));
			const sensors = await trx.select().from(sensorTable).where(eq(sensorTable.userId, user.id));
			if (sensors.length > 0) {
				await trx.insert(sensorHistoryTable).values(
					sensors.map((sensor) => ({
						sensorId: sensor.id,
						clientId: sensor.clientId,
						userId: user.id,
						sensorType: sensor.sensorType,
					}))
				);
			}

			for (const sensor of sensors) {
				await trx.delete(sensorTable).where(eq(sensorTable.id, sensor.id));
				await trx.insert(sensorTable).values({
					id: genID(30),
					clientId: sensor.clientId,
					userId: null,
					sensorType: sensor.sensorType,
				});
			}
		});
		waitUntil(
			logAction({
				fn: LogActionTypes.DELETE_ACCOUNT_ACTION,
				result: "success",
				details: {
					success: true,
					reason: null,
					user: user.id,
					session: sid,
				},
			})
		);
		await invalidateSession(session.id);
		await deleteSessionTokenCookie();
		return {
			success: true,
			message: "Ihr Konto wurde erfolgreich gelöscht.",
			path: "/",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.DELETE_ACCOUNT_ACTION,
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

export async function updateAccountNameAction(data: z.infer<typeof accountNameSchema>) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_ACCOUNT_NAME_ACTION,
					result: "failed",
					details: {
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

		const valid = accountNameSchema.safeParse(data);
		if (!valid.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_ACCOUNT_NAME_ACTION,
					result: "failed",
					details: {
						user: user.id,
						session: sid,
						reason: ErrorTypes.INVALID_INPUT,
						data: data,
					},
				})
			);
			return {
				success: false,
				message: "Bitte überprüfen Sie Ihre Eingaben.",
			};
		}

		if (user.id === "demo") {
			return {
				success: false,
				message: "Demo Account kann nicht aktualisiert werden.",
			};
		}

		const oldData = await db
			.select({
				firstname: userTable.firstname,
				lastname: userTable.lastname,
			})
			.from(userTable)
			.where(eq(userTable.id, user.id))
			.limit(1);
		await db
			.update(userTable)
			.set({
				firstname: data.firstname,
				lastname: data.lastname,
				username: `${data.firstname} ${data.lastname}`,
			})
			.where(eq(userTable.id, user.id));
		revalidatePath("/settings/acccount");
		waitUntil(
			logAction({
				fn: LogActionTypes.UPDATE_ACCOUNT_NAME_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					reason: null,
					data: {
						new: {
							firstname: user.firstname,
							lastname: user.lastname,
						},
						old: {
							firstname: oldData[0].firstname,
							lastname: oldData[0].lastname,
						},
					},
				},
			})
		);
		return {
			success: true,
			message: "Name erfolgreich aktualisiert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.UPDATE_ACCOUNT_NAME_ACTION,
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

export async function updateAccountInfoAction(data: z.infer<typeof accountInfoSchema>) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_ACCOUNT_INFO_ACTION,
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
				message: "Bitte melden Sie sich an.",
			};
		}

		const valid = accountInfoSchema.safeParse(data);
		if (!valid.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_ACCOUNT_INFO_ACTION,
					result: "failed",
					details: {
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
			return {
				success: false,
				message: "Demo Account kann nicht aktualisiert werden.",
			};
		}

		const oldData = await db
			.select({
				timezone: userTable.timezone,
				address: userTable.address,
				phone: userTable.phone,
			})
			.from(userTable)
			.where(eq(userTable.id, user.id))
			.limit(1);
		await db
			.update(userTable)
			.set({
				phone: data.phone,
				address: data.address,
				timezone: data.timezone,
			})
			.where(eq(userTable.id, user.id));
		revalidatePath("/settings/acccount");
		waitUntil(
			logAction({
				fn: LogActionTypes.UPDATE_ACCOUNT_INFO_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					reason: null,
					data: {
						new: {
							timezone: user.timezone,
							address: user.address,
							phone: user.phone,
						},
						old: {
							timezone: oldData[0].timezone,
							address: oldData[0].address,
							phone: oldData[0].phone,
						},
					},
				},
			})
		);
		return {
			success: true,
			message: "Daten erfolgreich aktualisiert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.UPDATE_ACCOUNT_INFO_ACTION,
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
