import { z } from "zod";

const mail_nonempty_msg = "Bitte gib eine E-Mail an.";
const mail_email_msg = "Bitte gib eine gültige E-Mail an.";

const password_nonempty_msg = "Bitte gib ein Passwort an.";

export const loginSchema = z.object({
    mail: z.string().nonempty({ message: mail_nonempty_msg }).email({ message: mail_email_msg }),
    password: z.string().nonempty({ message: password_nonempty_msg }),
});

export const signupSchema = z.object({
    username: z.string().nonempty({ message: "Bitte gib einen Benutzernamen an." }),
    mail: z.string().nonempty({ message: mail_nonempty_msg }).email({ message: mail_email_msg }),
    password: z.string().nonempty({ message: password_nonempty_msg }),
    passwordRepeat: z.string().nonempty({ message: password_nonempty_msg }),
});

export const forgotSchema = z.object({
    mail: z.string().nonempty({ message: mail_nonempty_msg }).email({ message: mail_email_msg }),
});

export const resetSchema = z.object({
    password: z.string().nonempty({ message: password_nonempty_msg }),
    passwordRepeat: z.string().nonempty({ message: password_nonempty_msg }),
});
