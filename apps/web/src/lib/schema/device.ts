import { z } from "zod";

export const deviceSchema = z.object({
    deviceName: z.string().min(1, { message: "Bitte gib einen Gerätenamen an." })
});