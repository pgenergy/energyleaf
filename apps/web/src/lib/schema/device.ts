import { z } from "zod";

export const deviceSchema = z.object({
    deviceName: z.string().nonempty({ message: "Bitte gib einen Gerätenamen an." })
});