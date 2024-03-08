import { z } from "zod";

export const signInSchema = z.object({
    email: z.string().email({ message: "Geben Sie bitte eine gültige E-Mail-Adresse ein." }),
    password: z.string().min(8, { message: "Das Passwort muss mindestens 8 Zeichen lang sein." }),
});
