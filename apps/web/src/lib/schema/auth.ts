import { z } from "zod";

export const loginSchema = z.object({
    mail: z
        .string()
        .nonempty({ message: "Bitte gib eine E-Mail an." })
        .email({ message: "Bitte gib eine gültige E-Mail an." }),
    password: z.string().nonempty({ message: "Bitte gib ein Passwort an." }),
});

export const signupSchema = z.object({
    username: z.string().nonempty({ message: "Bitte gib einen Benutzernamen an." }),
    mail: z
        .string()
        .nonempty({ message: "Bitte gib eine E-Mail an." })
        .email({ message: "Bitte gib eine gültige E-Mail an." }),
    password: z.string().nonempty({ message: "Bitte gib ein Passwort an." }),
    passwordRepeat: z.string().nonempty({ message: "Bitte gib ein Passwort an." }),
    sensorId: z.string().nonempty({ message: "Bitte gib eine Sensor-ID an." }),
});
