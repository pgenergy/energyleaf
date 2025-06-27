"use server";

import { ErrorTypes, LogActionTypes } from "@/lib/log-types";
import { accountInfoSchema, anomalySchema, reportConfigSchema } from "@/lib/schemas/profile-schema";
import { waitUntil } from "@vercel/functions";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "../db";
import { reportConfigTable } from "../db/tables/reports";
import { getCurrentSession } from "../lib/auth";
import { logAction, logError } from "../queries/logs";

export async function updateAnomalyAction(data: z.infer<typeof anomalySchema>) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_ANOMALY_ACTION,
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

		const valid = anomalySchema.safeParse(data);
		if (!valid.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_ANOMALY_ACTION,
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

		const reportConfig = await db
			.select()
			.from(reportConfigTable)
			.where(eq(reportConfigTable.userId, user.id))
			.limit(1);
		if (reportConfig.length === 0) {
			await db.insert(reportConfigTable).values({
				userId: user.id,
				anomaly: data.active,
			});
		} else {
			await db
				.update(reportConfigTable)
				.set({ anomaly: data.active })
				.where(eq(reportConfigTable.userId, user.id));
		}

		revalidatePath("/settings/reports");
		waitUntil(
			logAction({
				fn: LogActionTypes.UPDATE_ANOMALY_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					reason: null,
					success: true,
					data: {
						old: {
							anomaly: reportConfig[0].anomaly,
						},
						new: {
							anomaly: data.active,
						},
					},
				},
			})
		);
		return {
			success: true,
			message: "Anomalieerkennung erfolgreich aktualisiert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.UPDATE_ANOMALY_ACTION,
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

export async function updateReportConfigAction(data: z.infer<typeof reportConfigSchema>) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_REPORT_CONFIG_ACTION,
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
					fn: LogActionTypes.UPDATE_REPORT_CONFIG_ACTION,
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

		const reportConfig = await db
			.select()
			.from(reportConfigTable)
			.where(eq(reportConfigTable.userId, user.id))
			.limit(1);
		if (reportConfig.length === 0) {
			await db.insert(reportConfigTable).values({
				userId: user.id,
				reports: data.active,
				days: data.days,
			});
		} else {
			await db
				.update(reportConfigTable)
				.set({ reports: data.active, days: data.days })
				.where(eq(reportConfigTable.userId, user.id));
		}

		revalidatePath("/settings/reports");
		waitUntil(
			logAction({
				fn: LogActionTypes.UPDATE_REPORT_CONFIG_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					success: true,
					reason: null,
					data: {
						old: {
							active: reportConfig[0].reports,
							days: reportConfig[0].days,
						},
						new: {
							active: data.active,
							days: data.days,
						},
					},
				},
			})
		);
		return {
			success: true,
			message: "Berichteinstellungen erfolgreich aktualisiert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.UPDATE_REPORT_CONFIG_ACTION,
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
