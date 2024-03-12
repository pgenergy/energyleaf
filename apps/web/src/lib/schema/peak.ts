import { z } from "zod";

export const peakSchema = z.object({
    deviceId: z.string().min(1, { message: "Bitte geben Sie ein gültiges Gerät an." }),
});
