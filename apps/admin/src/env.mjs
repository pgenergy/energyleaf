import { vercel } from "@t3-oss/env-core/presets";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        NEXTAUTH_URL: z.string().optional(),
        NEXTAUTH_SECRET: z.string(),

        VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),

        DATABASE_HOST: z.string(),
        DATABASE_USERNAME: z.string(),
        DATABASE_PASSWORD: z.string(),
        DATABASE_NAME: z.string(),

        RESEND_API_KEY: z.string(),
        RESEND_API_MAIL: z.string().email(),

        CRON_SECRET: z.string(),

        ADMIN_MAIL: z.string().email(),

        BLOB_READ_WRITE_TOKEN: z.string().optional(),

        ML_API_URL: z.string(),
        ML_API_KEY: z.string(),
    },
    client: {},
    experimental__runtimeEnv: {},
    extends: [vercel()],
});

export const getUrl = (env) => {
    const vercelUrl = env.VERCEL_ENV === "production" ? env.VERCEL_PROJECT_PRODUCTION_URL : env.VERCEL_URL;
    return vercelUrl || env.NEXTAUTH_URL || "energyleaf.de";
};
