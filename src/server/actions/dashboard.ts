"use server";

import { ErrorTypes, LogActionTypes } from "@/lib/log-types";
import { dashboardConfigSchema } from "@/lib/schemas/profile-schema";
import { waitUntil } from "@vercel/functions";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { z } from "zod";
import { db } from "../db";
import { dashboardConfigTable } from "../db/tables/dashboard";
import { getCurrentSession } from "../lib/auth";
import { logAction, logError } from "../queries/logs";

export async function updateDashboardConfigAction(data: z.infer<typeof dashboardConfigSchema>) {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_DASHBOARD_CONFIG_ACTION,
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
				message: "Bitte melden Sie sich an.",
			};
		}

		const valid = dashboardConfigSchema.safeParse(data);
		if (!valid.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.UPDATE_DASHBOARD_CONFIG_ACTION,
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
				message: "Bitte überprüfen Sie Ihre Eingaben.",
			};
		}

		const dashboardConfig = await db
			.select()
			.from(dashboardConfigTable)
			.where(eq(dashboardConfigTable.userId, user.id))
			.limit(1);

		const oldComponents = dashboardConfig[0]?.activeComponents ?? [];

		if (dashboardConfig.length === 0) {
			await db.insert(dashboardConfigTable).values({
				userId: user.id,
				activeComponents: data.activeComponents,
			});
		} else {
			await db
				.update(dashboardConfigTable)
				.set({ activeComponents: data.activeComponents })
				.where(eq(dashboardConfigTable.userId, user.id));
		}

		revalidatePath("/dashboard");
		waitUntil(
			logAction({
				fn: LogActionTypes.UPDATE_DASHBOARD_CONFIG_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					success: true,
					reason: null,
					data: {
						old: {
							activeComponents: oldComponents,
						},
						new: {
							activeComponents: data.activeComponents,
						},
					},
				},
			}),
		);
		return {
			success: true,
			message: "Dashboard-Einstellungen erfolgreich aktualisiert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.UPDATE_DASHBOARD_CONFIG_ACTION,
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
