import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";

import { db } from "../db";
import { appConfigTable, AppConfigKeys, type AppConfigKey } from "../db/tables/config";

/**
 * Get a specific app config value by key.
 */
export const getAppConfigValue = cache(async (key: AppConfigKey): Promise<string | null> => {
	const result = await db.select().from(appConfigTable).where(eq(appConfigTable.key, key)).limit(1);
	return result[0]?.value ?? null;
});

/**
 * Get all app config values as a key-value object.
 */
export const getAppConfig = cache(async (): Promise<Record<string, string | null>> => {
	const result = await db.select().from(appConfigTable);
	const config: Record<string, string | null> = {};
	for (const row of result) {
		config[row.key] = row.value;
	}
	return config;
});

/**
 * Get base_url and secret_key config values.
 */
export const getCronConfig = cache(async (): Promise<{ baseUrl: string | null; secretKey: string | null }> => {
	const config = await getAppConfig();
	return {
		baseUrl: config[AppConfigKeys.BASE_URL] ?? null,
		secretKey: config[AppConfigKeys.SECRET_KEY] ?? null,
	};
});

/**
 * Get the secret key for API authentication (uncached for security-critical use).
 */
export async function getSecretKeyUncached(): Promise<string | null> {
	const result = await db
		.select()
		.from(appConfigTable)
		.where(eq(appConfigTable.key, AppConfigKeys.SECRET_KEY))
		.limit(1);
	return result[0]?.value ?? null;
}
