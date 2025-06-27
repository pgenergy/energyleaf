import { cache } from "react";
import "server-only";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { reportConfigTable } from "../db/tables/reports";

export const getReportConfig = cache(async (userId: string) => {
	const configs = await db.select().from(reportConfigTable).where(eq(reportConfigTable.userId, userId)).limit(1);

	if (configs.length === 0) {
		return null;
	}

	return configs[0];
});
