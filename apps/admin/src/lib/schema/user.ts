import { DismissedReasonEnum } from "@energyleaf/lib";
import { Versions } from "@energyleaf/lib/versioning";
import { userDataTable, userExperimentDataTable } from "@energyleaf/postgres/schema/user";
import { ExperimentNumberEnum } from "@energyleaf/postgres/types";
import { z } from "zod";

export const userStateSchema = z
    .object({
        isActive: z.boolean().default(true),
        isAdmin: z.boolean().default(false),
        isParticipant: z.boolean().default(false),
        appVersion: z.nativeEnum(Versions),
        experimentStatus: z.enum(userExperimentDataTable.experimentStatus.enumValues).optional(),
        dismissedReason: z.nativeEnum(DismissedReasonEnum).optional(),
        installationDate: z.date().optional(),
        deinstallationDate: z.date().optional(),
        getsPaid: z.boolean().default(false),
        usesProlific: z.boolean().default(false),
        experimentNumber: z.nativeEnum(ExperimentNumberEnum).optional(),
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

        if (
            data.experimentStatus === "dismissed" &&
            (data.dismissedReason === null || data.dismissedReason === undefined)
        ) {
            ctx.addIssue({
                code: "custom",
                message: "Ablehnungsgrund muss angegeben werden",
                path: ["dismissedReason"],
            });
        }
    });

export const userOnboardingFormSchema = z.object({
    meterNumber: z.string().min(1, { message: "Bitte geben Sie die Zählernummer an." }),
    file: z
        .instanceof(File)
        .refine((file) => file.size < 1024 * 1024 * 4, { message: "Die Datei darf maximal 4 MB groß sein." })
        .optional(),
    hasWifi: z.boolean().default(false),
    hasPower: z.boolean().default(false),
    meterType: z.enum([...userDataTable.electricityMeterType.enumValues], {
        message: "Bitte wählen Sie die Art ihres Zählers aus.",
    }),
});
