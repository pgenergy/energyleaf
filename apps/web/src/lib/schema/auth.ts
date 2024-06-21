import { userData } from "@energyleaf/db/schema";
import { z } from "zod";

const mailNonemptyMsg = "Bitte geben Sie eine E-Mail an.";
const mailEmailMsg = "Bitte geben Sie eine gültige E-Mail an.";

const passwordNonemptyMsg = "Bitte geben Sie ein Passwort an.";

export const loginSchema = z.object({
    mail: z.string().min(1, { message: mailNonemptyMsg }).email({ message: mailEmailMsg }),
    password: z.string().min(1, { message: passwordNonemptyMsg }),
});

export const signupSchema = z
    .object({
        firstname: z.string().min(1, { message: "Bitte geben Sie ihren Namen an." }),
        lastname: z.string().min(1, { message: "Bitte geben Sie ihren Nachnamen an." }),
        username: z.string().min(1, { message: "Bitte geben Sie einen Benutzernamen an." }),
        mail: z.string().min(1, { message: "Bitte geben Sie eine E-Mail an." }).email({ message: mailEmailMsg }),
        phone: z
            .string()
            .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, {
                message: "Geben Sie eine gültige Telefonnummer ein.",
            })
            .transform((d) => d.replaceAll(" ", ""))
            .optional(),
        address: z.string().min(1, { message: "Geben sie eine Adresse ein" }),
        password: z.string().min(8, { message: "Ihr Passwort muss eine Länge von mindestes 8 Zeichen haben." }),
        passwordRepeat: z.string().min(8, { message: "Ihr Passwort muss eine Länge von mindestesn 8 Zeichen haben." }),
        hasPower: z.boolean().default(false),
        hasWifi: z.boolean().default(false),
        comment: z.string().optional(),
        electricityMeterNumber: z.string().min(1, { message: "Bitte geben Sie einen Zählernummer an" }),
        electricityMeterType: z.enum([...userData.electricityMeterType.enumValues], {
            message: "Bitte wählen Sie die Art ihres Zählers aus.",
        }),
        file: z
            .instanceof(File)
            .refine((f) => f.size < 4000000, { message: "Das Bild darf nicht größer als 4MB sein." })
            .refine((f) => f.type.startsWith("image/"), { message: "Bitte wählen Sie ein Bild aus." }),
        tos: z
            .boolean()
            .default(false)
            .refine((d) => d, { message: "Sie müssen die Datenschutzbestimmung bestätigen." }),
        pin: z
            .boolean()
            .default(false)
            .refine((d) => d, { message: "Sie müssen uns die Berechtigung geben, einen PIN zu beantragen" }),
        participation: z.boolean().default(false),
        prolific: z.boolean().default(false),
    })
    .superRefine((data, ctx) => {
        if (data.password !== data.passwordRepeat) {
            ctx.addIssue({
                code: "custom",
                message: "Passwort stimmt nicht überein",
            });
        }
    });

export const forgotSchema = z.object({
    mail: z.string().min(1, { message: mailNonemptyMsg }).email({ message: mailEmailMsg }),
});

export const resetSchema = z.object({
    password: z.string().min(8, { message: "Ihr Passwort muss eine Länge von mindestes 8 Zeichen haben." }),
    passwordRepeat: z.string().min(8, { message: "Ihr Passwort muss eine Länge von mindestesn 8 Zeichen haben." }),
});
