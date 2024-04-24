import { userData } from "@energyleaf/db/schema";
import { z } from "zod";

export const passwordSchema = z.object({
    oldPassword: z.string().nonempty({ message: "Bitte geben Sie ein Passwort an." }),
    newPassword: z.string().nonempty({ message: "Bitte geben Sie ein Passwort an." }),
    newPasswordRepeat: z.string().nonempty({ message: "Bitte geben Sie ein Passwort an." }),
});

export const reportSettingsSchema = z.object({
    receiveMails: z.boolean().default(true),
    interval: z.coerce
        .number()
        .int()
        .positive({ message: "Bitte geben Sie einen positiven Wert für das Intervall an." })
        .max(7, { message: "Bitte geben Sie einen Wert <= 7 für das Intervall an." })
        .default(3),
    time: z.coerce
        .number()
        .int()
        .positive({ message: "Bitte geben Sie eine gültige Stunde (0-23 Uhr) an." })
        .max(23, { message: "Bitte geben Sie eine gültige Stunde (0-23 Uhr) an." })
        .default(6),
});

export const userDataSchema = z.object({
    houseType: z.enum([...userData.property.enumValues]).default(userData.property.enumValues[0]),
    livingSpace: z.coerce.number().int().positive({ message: "Bitte geben Sie eine gültige Wohnfläche an." }),
    people: z.coerce.number().int().positive({ message: "Bitte geben Sie eine gültige Anzahl an Personen an." }),
    hotWater: z.enum([...userData.hotWater.enumValues]).default(userData.hotWater.enumValues[0]),
    tariff: z.enum([...userData.tariff.enumValues]).default(userData.tariff.enumValues[0]),
    basePrice: z.coerce.number().positive({ message: "Bitte geben Sie einen positiven Betrag an." }),
    workingPrice: z.coerce
        .number()
        .positive({ message: "Bitte geben Sie einen positiven Betrag an." })
        .max(1, { message: "Bitte geben Sie einen Preis unter 1€ an." }),
    monthlyPayment: z.coerce
        .number()
        .int()
        .positive({ message: "Bitte geben Sie einen gültigen monatlichen Abschlag an." }),
});

export const deleteAccountSchema = z.object({
    password: z.string().nonempty({ message: "Bitte gib ein Passwort an." }),
});

export const userGoalSchema = z.object({
    goalValue: z.coerce
        .number()
        .int({ message: "Bitte geben Sie eine Zahl ohne Kommawerte ein." })
        .positive({ message: "Bitte geben Sie einen gültigen Wert an." }),
});
