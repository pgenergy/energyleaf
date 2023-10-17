import type { Config } from "drizzle-kit";

export default {
    schema: "./src/schema/*",
    driver: "mysql2",
    dbCredentials: {
        connectionString: process.env.DATABASE_PUSH_URL!,
    },
} satisfies Config;
