import { DeviceCategory } from "@energyleaf/db/types";
import { z } from "zod";

export const deviceSchema = z.object({
    deviceName: z.string().min(1, { message: "Bitte geben Sie einen Gerätenamen an." }),
    category: z
        .string()
        .min(1, { message: "Bitte geben Sie eine Kategorie an." })
        .refine((value) => Object.values(DeviceCategory).includes(value as DeviceCategory), {
            message: "Bitte wählen Sie eine Kategorie aus.",
        }),
});
