import { z } from "zod";
import {Versions} from "@energyleaf/lib";

export const userStateSchema = z.object({
    active: z.boolean().default(true),
    isAdmin: z.boolean().default(false),
    appVersion: z.nativeEnum(Versions),
});
