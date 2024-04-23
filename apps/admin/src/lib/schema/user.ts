import { Versions } from "@energyleaf/lib/versioning";
import { z } from "zod";

export const userStateSchema = z.object({
    active: z.boolean().default(true),
    isAdmin: z.boolean().default(false),
    appVersion: z.nativeEnum(Versions),
});
