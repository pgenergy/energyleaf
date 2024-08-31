import { userDataTable } from "@energyleaf/postgres/schema/user";
import { z } from "zod";

export const passwordSchema = z.object({
    oldPassword: z.string().min(1, { message: "Bitte geben Sie ein Passwort an." }),
    newPassword: z.string().min(1, { message: "Bitte geben Sie ein Passwort an." }),
    newPasswordRepeat: z.string().min(1, { message: "Bitte geben Sie ein Passwort an." }),
});

export const mailSettingsSchema = z.object({
    receiveReportMails: z.boolean().default(true),
    interval: z.coerce
        .number()
        .int()
        .positive({ message: "Bitte geben Sie einen positiven Wert für das Intervall an." })
        .max(7, { message: "Bitte geben Sie einen Wert <= 7 für das Intervall an." })
        .default(3),
    time: z.coerce
        .number()
        .int()
        .min(0, { message: "Bitte geben Sie eine gültige Stunde (0-23 Uhr) an." })
        .max(23, { message: "Bitte geben Sie eine gültige Stunde (0-23 Uhr) an." })
        .default(6),
    receiveAnomalyMails: z.boolean().default(true),
});

export const userDataSchema = z.object({
    houseType: z.enum([...userDataTable.property.enumValues]).default(userDataTable.property.enumValues[0]),
    livingSpace: z.coerce.number().int().positive({ message: "Bitte geben Sie eine gültige Wohnfläche an." }),
    people: z.coerce.number().int().positive({ message: "Bitte geben Sie eine gültige Anzahl an Personen an." }),
    hotWater: z.enum([...userDataTable.hotWater.enumValues]).default(userDataTable.hotWater.enumValues[0]),
    tariff: z.enum([...userDataTable.tariff.enumValues]).default(userDataTable.tariff.enumValues[0]),
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
    password: z.string().min(1, { message: "Bitte gib ein Passwort an." }),
});

export const userGoalSchema = z.object({
    goalValue: z.number().positive({ message: "Bitte geben Sie einen gültigen Wert an." }),
});
