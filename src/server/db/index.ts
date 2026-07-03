import { env } from "@/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const globalPgClient = globalThis as unknown as { pgClient: ReturnType<typeof postgres> };
const client = globalPgClient.pgClient || postgres(env.DATABASE_URL, { prepare: false });
export const db = drizzle({ client });

const isProduction = process.env.NODE_ENV === "production" || env.VERCEL_ENV === "production";

if (!isProduction) {
	globalPgClient.pgClient = client;
}

export type DB = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];
