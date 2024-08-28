import { drizzle } from "drizzle-orm/postgres-js";
import { customAlphabet } from "nanoid";
import postgres from "postgres";

const connection = postgres(process.env.PG_CONNECTION as string, { prepare: false });
export const db = drizzle(connection);

export const genId = (length = 30) => {
    const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890");
    return nanoid(length);
};
