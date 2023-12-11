import { z } from "zod";

import { userData } from "@energyleaf/db/schema";

export const baseInfromationSchema = z.object({
    username: z.string().nonempty({ message: "Bitte gib einen Benutzernamen an." }),
    email: z.string().email({ message: "Bitte gib eine gültige E-Mail-Adresse an." }),
});

export const passwordSchema = z.object({
    oldPassword: z.string().nonempty({ message: "Bitte gib ein Passwort an." }),
    newPassword: z.string().nonempty({ message: "Bitte gib ein Passwort an." }),
    newPasswordRepeat: z.string().nonempty({ message: "Bitte gib ein Passwort an." }),
});

export const mailSettingsSchema = z.object({
    daily: z.boolean().default(false),
    weekly: z.boolean().default(false),
});

export const userDataSchema = z.object({
    houseType: z.enum([...userData.immobilie.enumValues]).default(userData.immobilie.enumValues[0]),
    houseSize: z.coerce.number().int().positive({ message: "Bitte gib eine gültige Wohnfläche an." }),
    people: z.coerce.number().int().positive({ message: "Bitte gib eine gültige Anzahl an Personen an." }),
    warmWater: z.enum([...userData.warmwasser.enumValues]).default(userData.warmwasser.enumValues[0]),
    budget: z.coerce.number().int().positive({ message: "Bitte gib ein gültiges Budget an." }),
    tarif: z.enum([...userData.tarif.enumValues]).default(userData.tarif.enumValues[0]),
    price: z.coerce.number().positive({ message: "Bitte gib einen gültigen Preis an." }),
});

export const deleteAccountSchema = z.object({
    password: z.string().nonempty({ message: "Bitte gib ein Passwort an." }),
});
