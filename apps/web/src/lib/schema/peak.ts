import { z } from "zod";

export const deviceSchema = z.object({
    id: z.string().min(1),
    deviceId: z.number().optional(),
    name: z.string(),
    isDraft: z.boolean(),
    category: z.string(),
});

export const peakSchema = z.object({
    device: z.array(deviceSchema),
});
