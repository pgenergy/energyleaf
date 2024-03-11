import { Client } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import { nanoid } from "nanoid";

const connection = new Client({
    host: process.env["DATABASE_HOST"],
    username: process.env["DATABASE_USERNAME"],
    password: process.env["DATABASE_PASSWORD"],
});

const db = drizzle(connection);
export default db;

export const genId = (lenght = 25) => {
    return nanoid(lenght);
};
