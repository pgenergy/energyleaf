import { genID } from "@/lib/utils";
import { sql } from "drizzle-orm";
import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { userTable } from "./user";

export const HintStageEnum = ["simple", "intermediate", "expert"] as const;
export type HintStage = (typeof HintStageEnum)[number];

/**
 * Hint configuration per user - stores stage and progression
 */
export const hintConfigTable = pgTable("hint_config", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => genID(30)),
	userId: text("user_id")
		.notNull()
		.unique()
		.references(() => userTable.id, { onDelete: "cascade" }),
	stage: text("stage", { enum: HintStageEnum }).default("simple").notNull(),
	stageStartedAt: timestamp("stage_started_at", { mode: "date", withTimezone: true }).default(sql`now()`).notNull(),
	hintsEnabled: boolean("hints_enabled").default(true).notNull(),
	hintsDaysSeenInStage: integer("hints_days_seen_in_stage").default(0).notNull(),
});

export type HintConfig = typeof hintConfigTable.$inferSelect;

/**
 * Generated hints - one per user per day
 * Queue is managed via pgmq (hints_queue)
 */
export const hintsTable = pgTable("hints", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => genID(30)),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).default(sql`now()`).notNull(),
	forDate: timestamp("for_date", { mode: "date", withTimezone: true }).notNull(),
	hintType: text("hint_type").notNull(),
	hintStage: text("hint_stage", { enum: HintStageEnum }).notNull(),
	hintText: text("hint_text").notNull(),
	linkTarget: text("link_target").notNull(),
	seen: boolean("seen").default(false).notNull(),
	seenAt: timestamp("seen_at", { mode: "date", withTimezone: true }),
	clicked: boolean("clicked").default(false).notNull(),
	clickedAt: timestamp("clicked_at", { mode: "date", withTimezone: true }),
});

export type Hint = typeof hintsTable.$inferSelect;
