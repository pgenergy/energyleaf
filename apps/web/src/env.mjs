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

        ML_API_URL: z.string(),
        ML_API_KEY: z.string(),

        RESEND_API_KEY: z.string().optional(),
        RESEND_API_MAIL: z.string().email().optional(),

        ADMIN_MAIL: z.string().email().optional(),

        BLOB_READ_WRITE_TOKEN: z.string().optional(),
    },
    client: {},
    experimental__runtimeEnv: {},
    extends: [vercel()],
});

export const getUrl = (env) => {
    const vercelUrl = env.VERCEL_ENV === "production" ? env.VERCEL_PROJECT_PRODUCTION_URL : env.VERCEL_URL;
    return vercelUrl || "localhost:3000";
};
