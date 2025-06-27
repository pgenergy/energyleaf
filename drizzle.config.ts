import { defineConfig } from "drizzle-kit";

export default defineConfig({
    out: "./migrations",
	dialect: "postgresql",
	schema: "./src/server/db/tables/*",
	dbCredentials: {
		url: process.env.DATABASE_URL as string,
	},
});
