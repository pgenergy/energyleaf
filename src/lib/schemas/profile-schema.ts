import { z } from "zod";
import { HouseType, TariffType, TimeZoneType } from "../enums";

export const householdSchema = z.object({
	houseType: z.nativeEnum(HouseType).default(HouseType.Apartement),
	livingSpace: z.coerce
		.number({ required_error: "Bitte geben Sie ihre Gebäude Größe an." })
		.min(1, "Ihr Gebäude muss mindestens 1qm groß sein."),
	people: z.coerce
		.number({ required_error: "Bitte geben Sie an, wie viele Personen in ihrem Haushalt leben." })
		.min(1, "Es muss mindestens eine Person in Ihrem Haushalt leben."),
});

export const energyTarfiffSchema = z.object({
	tariffType: z.nativeEnum(TariffType).default(TariffType.Basic),
	basePrice: z.coerce
		.number({ required_error: "Bitte geben Sie den Basispreis an." })
		.min(0.01, "Der Basispreis muss mindestens 0,01 Euro betragen."),
	workingPrice: z.coerce
		.number({ required_error: "Bitte geben Sie den Arbeitspreis an." })
		.min(0.01, "Der Arbeitspreis muss mindestens 0,01 Euro betragen."),
	monthlyPayment: z.coerce
		.number({ required_error: "Bitte geben Sie die monatliche Zahlung an." })
		.min(1, "Die monatliche Zahlung muss mindestens 0,01 Euro betragen."),
});

export const accountNameSchema = z.object({
	firstname: z
		.string({ required_error: "Bitte geben Sie Ihren Vornamen an." })
		.min(1, "Bitte geben Sie Ihren Vornamen an."),
	lastname: z
		.string({ required_error: "Bitte geben Sie Ihren Nachnamen an." })
		.min(1, "Bitte geben Sie Ihren Nachnamen an."),
});

export const accountInfoSchema = z.object({
	phone: z
		.string({ required_error: "Bitte geben Sie Ihre Telefonnummer an." })
		.min(1, "Bitte geben Sie Ihre Telefonnummer an.")
		.optional(),
	address: z
		.string({ required_error: "Bitte geben Sie Ihre Adresse an." })
		.min(1, "Bitte geben Sie Ihre Adresse an.")
		.optional(),
	timezone: z.nativeEnum(TimeZoneType).default(TimeZoneType.Europe_Berlin),
});

export const energyGoalSchema = z.object({
	energy: z.coerce.number({ required_error: "Bitte geben Sie Ihren Energie-Zielwert an." }).optional(),
	cost: z.coerce
		.number({ required_error: "Bitte geben Sie Ihren Energie-Kosten-Zielwert an." })
		.min(0.01, "Der Energie-Kosten-Zielwert muss mindestens 0.01 Euro betragen."),
});

export const anomalySchema = z.object({
	active: z.boolean().default(true),
});

export const reportConfigSchema = z.object({
	active: z.boolean().default(true),
	days: z.array(z.number()).default([]),
});

export const deleteAccountSchema = z.object({
	password: z
		.string({ required_error: "Ihr Passwort ist notwendig um Ihren Account zu löschen." })
		.min(1, "Bitte geben Sie Ihr Passwort an."),
});
