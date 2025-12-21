"use server";

import { waitUntil } from "@vercel/functions";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ErrorTypes, LogActionTypes } from "@/lib/log-types";
import { db } from "../db";
import { userTable } from "../db/tables/user";
import { getCurrentSession } from "../lib/auth";
import { logAction, logError } from "../queries/logs";

export async function completeOnboardingAction() {
	try {
		const { user } = await getCurrentSession();
		const cookieStore = await cookies();
		const sid = cookieStore.get("sid")?.value;

		if (!user) {
			waitUntil(
				logAction({
					fn: LogActionTypes.COMPLETE_ONBOARDING_ACTION,
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

		// Demo user already has onboardingCompleted: true
		if (user.id === "demo") {
			return {
				success: true,
				message: "Onboarding abgeschlossen.",
				path: "/dashboard",
			};
		}

		await db.update(userTable).set({ onboardingCompleted: true }).where(eq(userTable.id, user.id));

		revalidatePath("/");

		waitUntil(
			logAction({
				fn: LogActionTypes.COMPLETE_ONBOARDING_ACTION,
				result: "success",
				details: {
					user: user.id,
					session: sid,
					success: true,
					reason: null,
				},
			}),
		);

		return {
			success: true,
			message: "Onboarding abgeschlossen.",
			path: "/dashboard",
		};
	} catch (err) {
		console.error(err);
		waitUntil(
			logError({
				fn: LogActionTypes.COMPLETE_ONBOARDING_ACTION,
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
