import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        NEXTAUTH_SECRET: z.string(),

        DATABASE_HOST: z.string(),
        DATABASE_USERNAME: z.string(),
        DATABASE_PASSWORD: z.string(),
        DATABASE_NAME: z.string(),

        SENDGRID_API_KEY: z.string(),
    },
    client: {},
    experimental__runtimeEnv: {},
});
