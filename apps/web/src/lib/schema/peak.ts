import { z } from "zod";

export const deviceSchema = z.object({
    id: z.number().int().positive("ID muss eine positive Ganzzahl sein"),
    name: z.string(),
});

export const peakSchema = z.object({
    device: z.array(deviceSchema).min(1, "Es muss mindestens ein Gerät ausgewählt werden")
});
