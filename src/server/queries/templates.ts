import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";

import { db } from "../db";
import { touTariffTemplateTable, type TouTariffTemplate } from "../db/tables/templates";

/**
 * Get all active TOU tariff templates.
 * Used for the user form preset selector.
 */
export const getTouTariffTemplates = cache(async (): Promise<TouTariffTemplate[]> => {
	const result = await db
		.select()
		.from(touTariffTemplateTable)
		.where(eq(touTariffTemplateTable.isActive, true))
		.orderBy(touTariffTemplateTable.name);
	return result;
});

/**
 * Get all TOU tariff templates including inactive ones.
 * Used for the admin management page.
 */
export const getAllTouTariffTemplatesAdmin = cache(async (): Promise<TouTariffTemplate[]> => {
	const result = await db.select().from(touTariffTemplateTable).orderBy(touTariffTemplateTable.name);
	return result;
});

/**
 * Get a single TOU tariff template by ID.
 */
export const getTouTariffTemplateById = cache(async (id: string): Promise<TouTariffTemplate | null> => {
	const result = await db.select().from(touTariffTemplateTable).where(eq(touTariffTemplateTable.id, id)).limit(1);
	return result[0] ?? null;
});
