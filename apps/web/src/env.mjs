import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        NEXTAUTH_URL: z.string().optional(),
        NEXTAUTH_SECRET: z.string(),

        VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
        VERCEL_ENV: z.string().optional(),

        DATABASE_HOST: z.string(),
        DATABASE_USERNAME: z.string(),
        DATABASE_PASSWORD: z.string(),
        DATABASE_NAME: z.string(),

        RESEND_API_KEY: z.string(),
        RESEND_API_MAIL: z.string().email(),

        ADMIN_MAIL: z.string().email(),

        BLOB_READ_WRITE_TOKEN: z.string().optional(),
    },
    client: {},
    experimental__runtimeEnv: {},
});

export const getUrl = (env) => {
    return env.VERCEL_PROJECT_PRODUCTION_URL || env.NEXTAUTH_URL || "energyleaf.de";
};
