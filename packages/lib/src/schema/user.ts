import { z } from "zod";

export const baseInformationSchema = z.object({
    username: z.string().nonempty({ message: "Bitte geben Sie einen Benutzernamen an." }),
    email: z.string().email({ message: "Bitte geben Sie eine gültige E-Mail-Adresse an." }),
});
