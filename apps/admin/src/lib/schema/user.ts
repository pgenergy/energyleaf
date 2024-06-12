import { userExperimentData } from "@energyleaf/db/schema";
import { Versions } from "@energyleaf/lib/versioning";
import { z } from "zod";

export const userStateSchema = z
    .object({
        isActive: z.boolean().default(true),
        isAdmin: z.boolean().default(false),
        isParticipant: z.boolean().default(false),
        appVersion: z.nativeEnum(Versions),
        experimentStatus: z.enum(userExperimentData.experimentStatus.enumValues).optional(),
        installationDate: z.date().optional(),
        deinstallationDate: z.date().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.experimentStatus === "installation" && !data.installationDate) {
            ctx.addIssue({
                code: "custom",
                message: "Installationsdatum muss angegeben werden",
                path: ["installationDate"],
            });
        }

        if (data.experimentStatus === "deinstallation" && !data.deinstallationDate) {
            ctx.addIssue({
                code: "custom",
                message: "Deinstallationsdatum muss angegeben werden",
                path: ["deinstallationDate"],
            });
        }
    });
