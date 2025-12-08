import { z } from "zod";
import { SensorType } from "../enums";

const SensorVersion = ["1", "2"] as const;

export const sensorSchema = z.object({
	clientId: z.string({ error: "Bitte geben Sie eine Client-ID an." }).min(1, "Bitte geben Sie eine Client-ID an."),
	sensorType: z.enum(SensorType, { error: "Bitte wählen Sie einen Sensortyp aus." }),
	version: z.enum(SensorVersion, { error: "Bitte wählen Sie eine Version aus." }),
	script: z.string().optional(),
});

export const sensorUpdateSchema = z.object({
	sensorType: z.enum(SensorType, { error: "Bitte wählen Sie einen Sensortyp aus." }),
	version: z.enum(SensorVersion, { error: "Bitte wählen Sie eine Version aus." }),
	script: z.string().optional(),
});

export const sensorAssignSchema = z.object({
	userId: z.string({ error: "Bitte wählen Sie einen Nutzer aus." }).min(1, "Bitte wählen Sie einen Nutzer aus."),
	initialValue: z.coerce
		.number({ error: "Bitte geben Sie einen gültigen Zählerstand an." })
		.min(0, "Der Zählerstand muss mindestens 0 sein."),
});
