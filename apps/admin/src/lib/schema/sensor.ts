import { z } from "zod";

import { SensorType } from "@energyleaf/db/types";

export const addSensorSchema = z.object({
    macAddress: z
        .string()
        .regex(/^(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/, "Bitte geben Sie eine gültige MAC-Adresse ein."),
    sensorType: z.nativeEnum(SensorType),
    script: z.string().optional(),
    currentValue: z.coerce.number().nonnegative(),
});

export const assignUserToSensorSchema = z.object({
    userId: z.string().nullable(),
});

export const addSensorValueSchema = z.object({
    value: z.coerce.number().nonnegative(),
});
