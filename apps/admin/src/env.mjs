import { vercel } from "@t3-oss/env-core/presets";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        HASH_SECRET: z.string(),

        PG_CONNECTION: z.string(),
        PG_DIRECT: z.string(),

        RESEND_API_KEY: z.string().optional(),
        RESEND_API_MAIL: z.string().email().optional(),

        CRON_SECRET: z.string(),

        ADMIN_MAIL: z.string().email().optional(),

        AWS_ACCESS_KEY_ID: z.string().optional(),
        AWS_SECRET_ACCESS_KEY: z.string().optional(),
        AWS_ENDPOINT_URL_S3: z.string().optional(),
        AWS_REGION: z.string().optional(),
        BUCKET_NAME: z.string().optional(),
        FILE_URL: z.string().optional(),

        ML_API_URL: z.string().optional(),
        ML_API_KEY: z.string().optional(),
    },
    client: {
        NEXT_PUBLIC_APP_URL: z.string(),
    },
    experimental__runtimeEnv: {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    },
    extends: [vercel()],
});

export const getUrl = (env) => {
    const vercelUrl = env.VERCEL_ENV === "production" ? env.VERCEL_PROJECT_PRODUCTION_URL : env.VERCEL_URL;
    return vercelUrl || "localhost:3001";
};
