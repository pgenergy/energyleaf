import type { Config } from "drizzle-kit";

export default {
    schema: "./src/schema/*",
    driver: "mysql2",
    dbCredentials: {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        uri: process.env.DATABASE_LOCAL_URL!,
    },
} satisfies Config;
