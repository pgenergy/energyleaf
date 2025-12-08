import { z } from "zod";
import { DeviceCategory } from "../enums";

export const deviceSchema = z.object({
	name: z.string({ error: "Bitte geben Sie einen Namen an." }).min(1, "Bitte geben Sie einen Namen an."),
	category: z.enum(DeviceCategory, { error: "Bitte wählen Sie eine Kategorie aus." }),
	power: z.coerce.number().min(1, "Die Leistung muss mindest ein Watt betragen").optional(),
});
