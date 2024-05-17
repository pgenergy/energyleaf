import { userData } from "@energyleaf/db/schema";
import { z } from "zod";

const mailNonemptyMsg = "Bitte geben Sie eine E-Mail an.";
const mailEmailMsg = "Bitte geben Sie eine gültige E-Mail an.";

const passwordNonemptyMsg = "Bitte geben Sie ein Passwort an.";

export const loginSchema = z.object({
    mail: z.string().min(1, { message: mailNonemptyMsg }).email({ message: mailEmailMsg }),
    password: z.string().min(1, { message: passwordNonemptyMsg }),
});

export const signupSchema = z.object({
    firstname: z.string().min(1, { message: "Bitte geben Sie ihren Namen an." }),
    lastname: z.string().min(1, { message: "Bitte geben Sie ihren Nachnamen an." }),
    username: z.string().min(1, { message: "Bitte geben Sie einen Benutzernamen an." }),
    mail: z.string().min(1, { message: "Bitte geben Sie eine E-Mail an." }).email({ message: mailEmailMsg }),
    phone: z
        .string()
        .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, {
            message: "Geben Sie eine gültige Telefonnummer ein.",
        })
        .optional(),
    address: z.string().min(1, { message: "Geben sie eine Adresse ein" }),
    password: z.string().min(1, { message: passwordNonemptyMsg }),
    passwordRepeat: z.string().min(1, { message: passwordNonemptyMsg }),
    hasPower: z.boolean().default(false),
    hasWifi: z.boolean().default(false),
    comment: z.string().optional(),
    electricityMeterType: z
        .enum([...userData.electricityMeterType.enumValues])
        .default(userData.electricityMeterType.enumValues[0]),
    file: z
        .instanceof(File)
        .refine((f) => f.size < 4000000, { message: "Das Bild darf nicht größer als 4MB sein." })
        .optional(),
});

export const forgotSchema = z.object({
    mail: z.string().min(1, { message: mailNonemptyMsg }).email({ message: mailEmailMsg }),
});

export const resetSchema = z.object({
    password: z.string().min(1, { message: passwordNonemptyMsg }),
    passwordRepeat: z.string().min(1, { message: passwordNonemptyMsg }),
});
