import { env } from "@/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const globalPgClient = globalThis as unknown as { pgClient: ReturnType<typeof postgres> };

const constructDatabaseUrl = (): string => {
	if (env.DATABASE_URL) {
		return env.DATABASE_URL;
	}
	const host = env.POSTGRES_HOST || "localhost";
	const port = env.POSTGRES_PORT || 5432;
	const user = env.POSTGRES_USER || "postgres";
	const password = env.POSTGRES_PASSWORD || "";
	const db = env.POSTGRES_DB || "postgres";
	return `postgres://${user}:${password}@${host}:${port}/${db}`;
};

const client = globalPgClient.pgClient || postgres(constructDatabaseUrl(), { prepare: false });
export const db = drizzle({ client });

const isProduction = process.env.NODE_ENV === "production" || env.VERCEL_ENV === "production";

if (!isProduction) {
	globalPgClient.pgClient = client;
}

export type DB = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];
