import { z } from "zod";

const mailNonemptyMsg = "Bitte geben Sie eine E-Mail an.";
const mailEmailMsg = "Bitte geben Sie eine gültige E-Mail an.";

const passwordNonemptyMsg = "Bitte geben Sie ein Passwort an.";

export const loginSchema = z.object({
    mail: z.string().nonempty({ message: mailNonemptyMsg }).email({ message: mailEmailMsg }),
    password: z.string().nonempty({ message: passwordNonemptyMsg }),
});

export const signupSchema = z.object({
    username: z.string().nonempty({ message: "Bitte geben Sie einen Benutzernamen an." }),
    mail: z.string().nonempty({ message: mailNonemptyMsg }).email({ message: mailEmailMsg }),
    password: z.string().nonempty({ message: passwordNonemptyMsg }),
    passwordRepeat: z.string().nonempty({ message: passwordNonemptyMsg }),
});

export const forgotSchema = z.object({
    mail: z.string().nonempty({ message: mailNonemptyMsg }).email({ message: mailEmailMsg }),
});

export const resetSchema = z.object({
    password: z.string().nonempty({ message: passwordNonemptyMsg }),
    passwordRepeat: z.string().nonempty({ message: passwordNonemptyMsg }),
});
