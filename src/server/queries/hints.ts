import { cache } from "react";
import "server-only";
import { startOfDay } from "date-fns";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "../db";
import { type Hint, type HintConfig, hintConfigTable, hintsTable } from "../db/tables/hints";

/**
 * Get hint config for a user
 */
export const getHintConfig = cache(async (userId: string): Promise<HintConfig | null> => {
	const configs = await db.select().from(hintConfigTable).where(eq(hintConfigTable.userId, userId)).limit(1);

	return configs.length > 0 ? configs[0] : null;
});

/**
 * Get or create hint config for a user
 */
export async function getOrCreateHintConfig(userId: string): Promise<HintConfig> {
	const existing = await db.select().from(hintConfigTable).where(eq(hintConfigTable.userId, userId)).limit(1);

	if (existing.length > 0) {
		return existing[0];
	}

	const [created] = await db
		.insert(hintConfigTable)
		.values({
			userId,
			stage: "simple",
			hintsEnabled: true,
			hintsDaysSeenInStage: 0,
		})
		.returning();

	return created;
}

/**
 * Update hint config for a user
 */
export async function updateHintConfig(
	userId: string,
	data: Partial<Pick<HintConfig, "stage" | "stageStartedAt" | "hintsEnabled" | "hintsDaysSeenInStage">>,
): Promise<void> {
	await db.update(hintConfigTable).set(data).where(eq(hintConfigTable.userId, userId));
}

/**
 * Get today's hint for a user
 */
export async function getTodayHint(userId: string): Promise<Hint | null> {
	const today = startOfDay(new Date());

	const hints = await db
		.select()
		.from(hintsTable)
		.where(and(eq(hintsTable.userId, userId), gte(hintsTable.forDate, today)))
		.orderBy(desc(hintsTable.createdAt))
		.limit(1);

	return hints.length > 0 ? hints[0] : null;
}

/**
 * Get recent hints for a user (for cycling logic)
 */
export async function getRecentHints(userId: string, days: number): Promise<Hint[]> {
	const since = new Date();
	since.setDate(since.getDate() - days);

	return db
		.select()
		.from(hintsTable)
		.where(and(eq(hintsTable.userId, userId), gte(hintsTable.createdAt, since)))
		.orderBy(desc(hintsTable.createdAt));
}

/**
 * Create a new hint
 */
export async function createHint(data: {
	userId: string;
	forDate: Date;
	hintType: string;
	hintStage: "simple" | "intermediate" | "expert";
	hintText: string;
	linkTarget: string;
}): Promise<Hint> {
	const [hint] = await db.insert(hintsTable).values(data).returning();
	return hint;
}

/**
 * Mark a hint as seen
 */
export async function markHintSeen(hintId: string): Promise<void> {
	await db
		.update(hintsTable)
		.set({
			seen: true,
			seenAt: new Date(),
		})
		.where(eq(hintsTable.id, hintId));
}

/**
 * Mark a hint as clicked
 */
export async function markHintClicked(hintId: string): Promise<void> {
	await db
		.update(hintsTable)
		.set({
			clicked: true,
			clickedAt: new Date(),
		})
		.where(eq(hintsTable.id, hintId));
}

/**
 * Get a hint by ID
 */
export async function getHintById(hintId: string): Promise<Hint | null> {
	const hints = await db.select().from(hintsTable).where(eq(hintsTable.id, hintId)).limit(1);
	return hints.length > 0 ? hints[0] : null;
}

/**
 * Check if a hint exists for a user for today
 */
export async function hasHintForToday(userId: string): Promise<boolean> {
	const today = startOfDay(new Date());

	const [{ total }] = await db
		.select({ total: count() })
		.from(hintsTable)
		.where(and(eq(hintsTable.userId, userId), gte(hintsTable.forDate, today)));

	return total > 0;
}

/**
 * Increment the hints days seen counter for a user
 */
export async function incrementHintsDaysSeen(userId: string): Promise<void> {
	await db
		.update(hintConfigTable)
		.set({
			hintsDaysSeenInStage: sql`${hintConfigTable.hintsDaysSeenInStage} + 1`,
		})
		.where(eq(hintConfigTable.userId, userId));
}
