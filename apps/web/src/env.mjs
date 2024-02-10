import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        NEXTAUTH_URL: z.string().optional(),
        NEXTAUTH_SECRET: z.string(),

        VERCEL_URL: z.string().optional(),

        DATABASE_HOST: z.string(),
        DATABASE_USERNAME: z.string(),
        DATABASE_PASSWORD: z.string(),
        DATABASE_NAME: z.string(),

        RESEND_API_KEY: z.string(),
        RESEND_API_MAIL: z.string(),

    },
    client: {},
    experimental__runtimeEnv: {},
});
