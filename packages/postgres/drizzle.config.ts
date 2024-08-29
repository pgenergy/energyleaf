import type { Config } from "drizzle-kit";

export default {
    schema: "./src/schema/*",
    dialect: "postgresql",
    dbCredentials: {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        url: process.env.PG_DIRECT!,
    },
    out: "./drizzle",
} satisfies Config;
