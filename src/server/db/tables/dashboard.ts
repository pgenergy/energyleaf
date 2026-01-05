import { json, pgTable, text } from "drizzle-orm/pg-core";
import { genID } from "@/lib/utils";
import { userTable } from "./user";

export const dashboardConfigTable = pgTable("dashboard_config", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => genID(30)),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id, { onDelete: "cascade" })
		.unique(),
	activeComponents: json("active_components").$type<string[]>().notNull().default([]),
});

export type DashboardConfig = typeof dashboardConfigTable.$inferSelect;
