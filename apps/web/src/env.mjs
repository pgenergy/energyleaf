import { vercel } from "@t3-oss/env-core/presets";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        ADMIN_URL: z.string(),
        HASH_SECRET: z.string(),

        VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),

        DATABASE_HOST: z.string(),
        DATABASE_USERNAME: z.string(),
        DATABASE_PASSWORD: z.string(),
        DATABASE_NAME: z.string(),

        RESEND_API_KEY: z.string().optional(),
        RESEND_API_MAIL: z.string().email().optional(),

        ADMIN_MAIL: z.string().email().optional(),

        AWS_ACCESS_KEY_ID: z.string().optional(),
        AWS_SECRET_ACCESS_KEY: z.string().optional(),
        AWS_ENDPOINT_URL_S3: z.string().optional(),
        AWS_REGION: z.string().optional(),
        BUCKET_NAME: z.string().optional(),
        FILE_URL: z.string().url().optional(),
    },
    client: {},
    experimental__runtimeEnv: {},
    extends: [vercel()],
});

export const getUrl = (env) => {
    const vercelUrl = env.VERCEL_ENV === "production" ? env.VERCEL_PROJECT_PRODUCTION_URL : env.VERCEL_URL;
    return vercelUrl || "localhost:3000";
};
