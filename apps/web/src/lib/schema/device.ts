import { z } from "zod";

import { DeviceCategory } from "@energyleaf/db/types";

export const deviceSchema = z.object({
    deviceName: z.string().min(1, { message: "Bitte gib einen Gerätenamen an." }),
    category: z.string().refine((value) => Object.keys(DeviceCategory).includes(value as DeviceCategory), {
        message: "Bitte wähle eine Kategorie aus.",
    }),
});
