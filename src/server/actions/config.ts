"use server";

import { waitUntil } from "@vercel/functions";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { ErrorTypes, LogActionTypes } from "@/lib/log-types";
import { db } from "../db";
import { appConfigTable, AppConfigKeys, type AppConfigKey } from "../db/tables/config";
import { getCurrentSession } from "../lib/auth";
import { logAction, logError } from "../queries/logs";

interface ActionResult {
	success: boolean;
	message: string;
}

const cronConfigSchema = z.object({
	baseUrl: z.string().url("Bitte geben Sie eine gültige URL ein."),
	secretKey: z.string().min(16, "Der Secret Key muss mindestens 16 Zeichen lang sein."),
});

async function upsertAppConfig(key: AppConfigKey, value: string): Promise<void> {
	await db.insert(appConfigTable).values({ key, value }).onConflictDoUpdate({
		target: appConfigTable.key,
		set: { value },
	});
}

export async function updateCronConfigAction(data: z.infer<typeof cronConfigSchema>): Promise<ActionResult> {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user || !user.isAdmin) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_APP_CONFIG_ACTION,
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

		const valid = cronConfigSchema.safeParse(data);
		if (!valid.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_APP_CONFIG_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.INVALID_INPUT,
						user: user.id,
						session: sid,
					},
				}),
			);
			return {
				success: false,
				message: valid.error.issues[0]?.message ?? "Bitte überprüfen Sie Ihre Eingaben.",
			};
		}

		// Get old base_url value for logging
		const oldBaseUrl = await db
			.select()
			.from(appConfigTable)
			.where(eq(appConfigTable.key, AppConfigKeys.BASE_URL))
			.limit(1);

		// Update both values
		await Promise.all([
			upsertAppConfig(AppConfigKeys.BASE_URL, valid.data.baseUrl),
			upsertAppConfig(AppConfigKeys.SECRET_KEY, valid.data.secretKey),
		]);

		revalidatePath("/admin/settings/general");

		waitUntil(
			logAction({
				fn: LogActionTypes.ADMIN_UPDATE_APP_CONFIG_ACTION,
				result: "success",
				details: {
					success: true,
					reason: null,
					user: user.id,
					session: sid,
					oldBaseUrl: oldBaseUrl[0]?.value ?? null,
					newBaseUrl: valid.data.baseUrl,
					// Don't log the actual secret value
				},
			}),
		);

		return {
			success: true,
			message: "Cron-Konfiguration erfolgreich aktualisiert.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.ADMIN_UPDATE_APP_CONFIG_ACTION,
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
