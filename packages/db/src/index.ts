import { Client } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import { nanoid } from "nanoid";

const getConnection = () => {
    const host = process.env.DATABASE_HOST as string;
    const username = process.env.DATABASE_USERNAME as string;
    const password = process.env.DATABASE_PASSWORD as string;

    if (!host || !username || !password) {
        throw new Error("Database connection not found");
    }

    if (host.startsWith("http")) {
        const localHost = host.replace("http://", "");
        return new Client({
            url: `http://${username}:${password}@${localHost}`,
        });
    }

    return new Client({
        host,
        username,
        password,
    });
};

const connection = getConnection();

const db = drizzle(connection);
export default db;

export const genId = (lenght = 25) => {
    return nanoid(lenght);
};
