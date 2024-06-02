import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-core/presets";
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

        ADMIN_MAIL: z.string().email(),

        BLOB_READ_WRITE_TOKEN: z.string().optional(),
    },
    client: {
        NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
        NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
    },
    experimental__runtimeEnv: {
        NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    },
    extends: [ vercel() ],
});

export const getUrl = (env) => {
    const vercelUrl = env.VERCEL_ENV === "production" ? env.VERCEL_PROJECT_PRODUCTION_URL : env.VERCEL_URL;
    return vercelUrl || env.NEXTAUTH_URL || "energyleaf.de";
};
