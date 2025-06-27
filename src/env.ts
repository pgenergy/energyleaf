import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().url(),

		// S3
		S3_ENDPOINT: z.string().url().optional(),
		S3_REGION: z.string().optional(),
		S3_ACCESS_KEY: z.string().optional(),
		S3_SECRET_KEY: z.string().optional(),

		// Cron
		CRON_SECRET: z.string(),

		// Resend
		RESEND_API_MAIL: z.string().email().optional(),
		RESEND_API_KEY: z.string().optional(),

		// Settings
		DISABLE_SIGNUP: z
			.string()
			.optional()
			.default("false")
			.transform((s) => s === "true" || s === "1"),
		DISABLE_EXPERIMENT: z
			.string()
			.optional()
			.default("false")
			.transform((s) => s === "true" || s === "1"),
		DISABLE_TRACKING: z
			.string()
			.optional()
			.default("true")
			.transform((s) => s === "true" || s === "1"),
		DISABLE_LOGS: z
			.string()
			.optional()
			.default("true")
			.transform((s) => s === "true" || s === "1"),
		DISABLE_DEMO: z
			.string()
			.optional()
			.default("true")
			.transform((s) => s === "true" || s === "1"),
	},
	client: {},
	experimental__runtimeEnv: {},
	extends: [vercel()],
});
