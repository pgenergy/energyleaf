import { z } from "zod";

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const tariffZoneSchema = z.object({
	start: z.string().regex(timeRegex, "Ungültige Startzeit (HH:MM)"),
	end: z.string().regex(timeRegex, "Ungültige Endzeit (HH:MM)"),
	price: z.coerce.number({ error: "Bitte geben Sie den Preis an." }).min(0, "Der Preis darf nicht negativ sein."),
});

const weekdayZonesSchema = z.array(tariffZoneSchema).nullable().optional();

export const touTariffTemplateSchema = z.object({
	name: z
		.string({ error: "Bitte geben Sie einen Namen an." })
		.min(1, "Name ist erforderlich")
		.max(100, "Name darf maximal 100 Zeichen lang sein"),
	description: z.string().max(500, "Beschreibung darf maximal 500 Zeichen lang sein").optional(),
	isActive: z.boolean().default(true),
	basePrice: z.coerce
		.number({ error: "Bitte geben Sie den Grundpreis an." })
		.min(0, "Der Grundpreis darf nicht negativ sein."),
	standardPrice: z.coerce
		.number({ error: "Bitte geben Sie den Standardpreis an." })
		.min(0, "Der Preis darf nicht negativ sein."),
	zones: z.array(tariffZoneSchema).default([]),
	weekdayZones: z
		.object({
			monday: weekdayZonesSchema,
			tuesday: weekdayZonesSchema,
			wednesday: weekdayZonesSchema,
			thursday: weekdayZonesSchema,
			friday: weekdayZonesSchema,
			saturday: weekdayZonesSchema,
			sunday: weekdayZonesSchema,
		})
		.default({}),
});

export type TouTariffTemplateInput = z.input<typeof touTariffTemplateSchema>;
export type TouTariffTemplateOutput = z.output<typeof touTariffTemplateSchema>;
