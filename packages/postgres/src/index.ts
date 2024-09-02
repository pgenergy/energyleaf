import { drizzle } from "drizzle-orm/postgres-js";
import { customAlphabet } from "nanoid";
import postgres from "postgres";

const globalPgClient = globalThis as unknown as { pgClient: ReturnType<typeof postgres> };

const connection = globalPgClient.pgClient || postgres(process.env.PG_CONNECTION as string, { prepare: false });
export const db = drizzle(connection);

if (!process.env.VERCEL_ENV) {
    globalPgClient.pgClient = connection;
}

export const genId = (length = 30) => {
    const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890");
    return nanoid(length);
};

export type DB = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];
