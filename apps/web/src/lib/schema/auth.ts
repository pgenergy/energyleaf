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
    username: z.string().min(1, { message: "Bitte geben Sie einen Benutzernamen an." }),
    mail: z.string().min(1, { message: "Bitte geben Sie eine E-Mail an." }).email({ message: mailEmailMsg }),
    password: z.string().min(1, { message: passwordNonemptyMsg }),
    passwordRepeat: z.string().min(1, { message: passwordNonemptyMsg }),
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
