import { z } from "zod";
import { DeviceCategory } from "../enums";

export const deviceSchema = z.object({
	name: z.string({ required_error: "Bitte geben Sie einen Namen an." }).min(1, "Bitte geben Sie einen Namen an."),
	category: z.nativeEnum(DeviceCategory, { required_error: "Bitte wählen Sie eine Kategorie aus." }),
	power: z.coerce.number().min(1, "Die Leistung muss mindest ein Watt betragen").optional(),
});
