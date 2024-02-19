import { z } from "zod";

export const baseInformationSchema = z.object({
    username: z.string().nonempty({ message: "Bitte gib einen Benutzernamen an." }),
    email: z.string().email({ message: "Bitte gib eine gültige E-Mail-Adresse an." }),
});