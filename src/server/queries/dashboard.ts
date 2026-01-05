import { cache } from "react";
import "server-only";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { dashboardConfigTable } from "../db/tables/dashboard";

/**
 * Get the dashboard configuration for a user
 * Returns the active components array, or null if no config exists
 */
export const getDashboardConfig = cache(async (userId: string) => {
	const configs = await db
		.select()
		.from(dashboardConfigTable)
		.where(eq(dashboardConfigTable.userId, userId))
		.limit(1);

	if (configs.length === 0) {
		return null;
	}

	return configs[0];
});
