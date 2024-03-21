import { z } from "zod";

import { userData } from "@energyleaf/db/schema";

export const passwordSchema = z.object({
    oldPassword: z.string().nonempty({ message: "Bitte geben Sie ein Passwort an." }),
    newPassword: z.string().nonempty({ message: "Bitte geben Sie ein Passwort an." }),
    newPasswordRepeat: z.string().nonempty({ message: "Bitte geben Sie ein Passwort an." }),
});

export const mailSettingsSchema = z.object({
    daily: z.boolean().default(false),
    weekly: z.boolean().default(false),
});

export const userDataSchema = z.object({
    houseType: z.enum([...userData.property.enumValues]).default(userData.property.enumValues[0]),
    livingSpace: z.coerce.number().int().positive({ message: "Bitte geben Sie eine gültige Wohnfläche an." }),
    people: z.coerce.number().int().positive({ message: "Bitte geben Sie eine gültige Anzahl an Personen an." }),
    hotWater: z.enum([...userData.hotWater.enumValues]).default(userData.hotWater.enumValues[0]),
    budget: z.coerce.number().int().positive({ message: "Bitte geben Sie ein gültiges Budget an." }),
    tariff: z.enum([...userData.tariff.enumValues]).default(userData.tariff.enumValues[0]),
    basePrice: z.coerce
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
