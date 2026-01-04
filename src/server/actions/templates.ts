"use server";

import { waitUntil } from "@vercel/functions";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { z } from "zod";
import { ErrorTypes, LogActionTypes } from "@/lib/log-types";
import { touTariffTemplateSchema } from "@/lib/schemas/template-schema";
import { db } from "../db";
import { touTariffTemplateTable } from "../db/tables/templates";
import { getCurrentSession } from "../lib/auth";
import { logAction, logError } from "../queries/logs";

interface ActionResult {
	success: boolean;
	message: string;
	path?: string;
}

export async function createTouTariffTemplateAction(
	data: z.infer<typeof touTariffTemplateSchema>,
): Promise<ActionResult> {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user || !user.isAdmin) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_CREATE_TOU_TEMPLATE_ACTION,
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

		const valid = touTariffTemplateSchema.safeParse(data);
		if (!valid.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_CREATE_TOU_TEMPLATE_ACTION,
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

		const payload = valid.data;

		// Check if name already exists
		const existing = await db
			.select({ id: touTariffTemplateTable.id })
			.from(touTariffTemplateTable)
			.where(eq(touTariffTemplateTable.name, payload.name))
			.limit(1);

		if (existing.length > 0) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_CREATE_TOU_TEMPLATE_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.NAME_EXISTS,
						user: user.id,
						session: sid,
						data,
					},
				}),
			);
			return {
				success: false,
				message: "Eine Vorlage mit diesem Namen existiert bereits.",
			};
		}

		const result = await db
			.insert(touTariffTemplateTable)
			.values({
				name: payload.name,
				description: payload.description ?? null,
				isActive: payload.isActive,
				basePrice: payload.basePrice,
				standardPrice: payload.standardPrice,
				zones: payload.zones,
				weekdayZones: payload.weekdayZones,
			})
			.returning({ id: touTariffTemplateTable.id });

		revalidatePath("/admin/settings/tou-templates");

		waitUntil(
			logAction({
				fn: LogActionTypes.ADMIN_CREATE_TOU_TEMPLATE_ACTION,
				result: "success",
				details: {
					success: true,
					reason: null,
					user: user.id,
					session: sid,
					templateId: result[0]?.id,
					data: payload,
				},
			}),
		);

		return {
			success: true,
			message: "Vorlage erfolgreich erstellt.",
			path: "/admin/settings/tou-templates",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.ADMIN_CREATE_TOU_TEMPLATE_ACTION,
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

export async function updateTouTariffTemplateAction(
	id: string,
	data: z.infer<typeof touTariffTemplateSchema>,
): Promise<ActionResult> {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user || !user.isAdmin) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_TOU_TEMPLATE_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: user ? ErrorTypes.NOT_ADMIN : ErrorTypes.NOT_LOGGED_IN,
						user: user?.id ?? null,
						session: sid,
						templateId: id,
					},
				}),
			);
			return {
				success: false,
				message: "Sie sind nicht berechtigt, diese Aktion durchzuführen.",
			};
		}

		const valid = touTariffTemplateSchema.safeParse(data);
		if (!valid.success) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_UPDATE_TOU_TEMPLATE_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: ErrorTypes.INVALID_INPUT,
						user: user.id,
						session: sid,
						templateId: id,
						data,
					},
				}),
			);
			return {
				success: false,
				message: "Bitte überprüfen Sie Ihre Eingaben.",
			};
		}

		const payload = valid.data;

		// Check if template exists
		const existing = await db
			.select()
			.from(touTariffTemplateTable)
			.where(eq(touTariffTemplateTable.id, id))
			.limit(1);

		if (existing.length === 0) {
			return {
				success: false,
				message: "Vorlage nicht gefunden.",
			};
		}

		// Check if name is being changed and already exists
		if (payload.name !== existing[0].name) {
			const nameExists = await db
				.select({ id: touTariffTemplateTable.id })
				.from(touTariffTemplateTable)
				.where(eq(touTariffTemplateTable.name, payload.name))
				.limit(1);

			if (nameExists.length > 0) {
				return {
					success: false,
					message: "Eine Vorlage mit diesem Namen existiert bereits.",
				};
			}
		}

		await db
			.update(touTariffTemplateTable)
			.set({
				name: payload.name,
				description: payload.description ?? null,
				isActive: payload.isActive,
				basePrice: payload.basePrice,
				standardPrice: payload.standardPrice,
				zones: payload.zones,
				weekdayZones: payload.weekdayZones,
			})
			.where(eq(touTariffTemplateTable.id, id));

		revalidatePath("/admin/settings/tou-templates");
		revalidatePath(`/admin/settings/tou-templates/${id}/edit`);

		waitUntil(
			logAction({
				fn: LogActionTypes.ADMIN_UPDATE_TOU_TEMPLATE_ACTION,
				result: "success",
				details: {
					success: true,
					reason: null,
					user: user.id,
					session: sid,
					templateId: id,
					data: {
						old: existing[0],
						new: payload,
					},
				},
			}),
		);

		return {
			success: true,
			message: "Vorlage erfolgreich aktualisiert.",
			path: "/admin/settings/tou-templates",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.ADMIN_UPDATE_TOU_TEMPLATE_ACTION,
				error: err as Error,
				details: {
					user: null,
					session: null,
					templateId: id,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}

export async function deleteTouTariffTemplateAction(id: string): Promise<ActionResult> {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user || !user.isAdmin) {
			waitUntil(
				logAction({
					fn: LogActionTypes.ADMIN_DELETE_TOU_TEMPLATE_ACTION,
					result: "failed",
					details: {
						success: false,
						reason: user ? ErrorTypes.NOT_ADMIN : ErrorTypes.NOT_LOGGED_IN,
						user: user?.id ?? null,
						session: sid,
						templateId: id,
					},
				}),
			);
			return {
				success: false,
				message: "Sie sind nicht berechtigt, diese Aktion durchzuführen.",
			};
		}

		// Check if template exists
		const existing = await db
			.select()
			.from(touTariffTemplateTable)
			.where(eq(touTariffTemplateTable.id, id))
			.limit(1);

		if (existing.length === 0) {
			return {
				success: false,
				message: "Vorlage nicht gefunden.",
			};
		}

		await db.delete(touTariffTemplateTable).where(eq(touTariffTemplateTable.id, id));

		revalidatePath("/admin/settings/tou-templates");

		waitUntil(
			logAction({
				fn: LogActionTypes.ADMIN_DELETE_TOU_TEMPLATE_ACTION,
				result: "success",
				details: {
					success: true,
					reason: null,
					user: user.id,
					session: sid,
					templateId: id,
					deletedTemplate: existing[0],
				},
			}),
		);

		return {
			success: true,
			message: "Vorlage erfolgreich gelöscht.",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.ADMIN_DELETE_TOU_TEMPLATE_ACTION,
				error: err as Error,
				details: {
					user: null,
					session: null,
					templateId: id,
				},
			}),
		);
		return {
			success: false,
			message: "Es ist ein unerwarteter Fehler aufgetreten.",
		};
	}
}
