import { z } from "zod";

export const baseInformationSchema = z.object({
    firstname: z.string().min(1, { message: "Bitte geben Sie ihren Vornamen an." }),
    lastname: z.string().min(1, { message: "Bitte geben Sie ihren Nachnamen an." }),
    username: z.string().min(1, { message: "Bitte geben Sie einen Benutzernamen an." }),
    email: z.string().email({ message: "Bitte geben Sie eine gültige E-Mail-Adresse an." }),
    phone: z
        .string()
        .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, {
            message: "Geben Sie eine gültige Telefonnummer ein.",
        })
        .optional(),
    address: z.string().min(1, { message: "Bitte geben Sie ihre Adresse an." }),
});
