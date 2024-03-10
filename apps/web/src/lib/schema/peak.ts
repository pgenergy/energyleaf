import { z } from "zod";

export const peakSchema = z.object({
    deviceId: z.string().min(1, { message: "Bitte geben Sie eine gültige Geräte-ID an." }),
});
