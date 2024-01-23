import {z} from "zod";
import {SensorType} from "@energyleaf/db/schema";

export const addSensorSchema = z.object({
    id: z.string(),
    macAddress: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})|([0-9a-fA-F]{4}\\.[0-9a-fA-F]{4}\\.[0-9a-fA-F]{4})$”/),
    sensorType: z.nativeEnum(SensorType),
});