import type { Config } from "drizzle-kit";

export default {
    schema: "./src/schema/*",
    dialect: "mysql",
    dbCredentials: {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        url: process.env.DATABASE_LOCAL_URL!,
    },
} satisfies Config;
