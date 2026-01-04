import { pgTable, text } from "drizzle-orm/pg-core";

export const appConfigTable = pgTable("app_config", {
	key: text("key").primaryKey().notNull(),
	value: text("value"),
});

export type AppConfig = typeof appConfigTable.$inferSelect;

// Known config keys
export const AppConfigKeys = {
	BASE_URL: "base_url",
	SECRET_KEY: "secret_key",
} as const;

export type AppConfigKey = (typeof AppConfigKeys)[keyof typeof AppConfigKeys];
