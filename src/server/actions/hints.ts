"use server";

import { db } from "@/server/db";
import { actionLogsTable } from "@/server/db/tables/logs";
import { getCurrentSession } from "@/server/lib/auth";
import { getHintById, incrementHintsDaysSeen, markHintClicked, markHintSeen } from "@/server/queries/hints";

interface ActionResponse {
	success: boolean;
	message: string;
}

/**
 * Mark a hint as seen when the user views the dashboard
 * Also increments the days seen counter for stage progression
 */
export async function trackHintSeen(hintId: string): Promise<ActionResponse> {
	try {
		const { user } = await getCurrentSession();
		if (!user) {
			return { success: false, message: "Nicht authentifiziert" };
		}

		const hint = await getHintById(hintId);
		if (!hint) {
			return { success: false, message: "Hinweis nicht gefunden" };
		}

		if (hint.userId !== user.id) {
			return { success: false, message: "Keine Berechtigung" };
		}

		if (!hint.seen) {
			await markHintSeen(hintId);
			await incrementHintsDaysSeen(user.id);

			if (user.isParticipant) {
				await db.insert(actionLogsTable).values({
					function: "hints",
					action: "hint_seen",
					details: {
						userId: user.id,
						hintId: hint.id,
						hintType: hint.hintType,
						hintStage: hint.hintStage,
						forDate: hint.forDate.toISOString(),
					},
				});
			}
		}

		return { success: true, message: "Hinweis als gesehen markiert" };
	} catch (error) {
		console.error("Error tracking hint seen:", error);
		return { success: false, message: "Fehler beim Markieren des Hinweises" };
	}
}

/**
 * Mark a hint as clicked when the user clicks the link
 */
export async function trackHintClick(hintId: string): Promise<ActionResponse> {
	try {
		const { user } = await getCurrentSession();
		if (!user) {
			return { success: false, message: "Nicht authentifiziert" };
		}

		const hint = await getHintById(hintId);
		if (!hint) {
			return { success: false, message: "Hinweis nicht gefunden" };
		}

		if (hint.userId !== user.id) {
			return { success: false, message: "Keine Berechtigung" };
		}

		if (!hint.clicked) {
			await markHintClicked(hintId);

			if (user.isParticipant) {
				await db.insert(actionLogsTable).values({
					function: "hints",
					action: "hint_clicked",
					details: {
						userId: user.id,
						hintId: hint.id,
						hintType: hint.hintType,
						hintStage: hint.hintStage,
						linkTarget: hint.linkTarget,
						forDate: hint.forDate.toISOString(),
					},
				});
			}
		}

		return { success: true, message: "Klick erfasst" };
	} catch (error) {
		console.error("Error tracking hint click:", error);
		return { success: false, message: "Fehler beim Erfassen des Klicks" };
	}
}
