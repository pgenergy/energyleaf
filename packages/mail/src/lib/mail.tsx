import { Resend } from "resend";

import PasswordChangedTemplate from "../templates/password-changed";
import PasswordResetTemplate from "../templates/password-reset";

interface MailOptions {
    apiKey: string;
    from: string;
}

/**
 * Create a new Resend instance
 * internal use only
 */
function createResend(apiKey: string) {
    return new Resend(apiKey);
}

interface PasswordResetMailOptions extends MailOptions {
    to: string;
    name: string;
    link: string;
}

/**
 * Send a password reset email
 *
 * @param to - The email to send the reset link to
 * @param name - The name of the user
 * @param link - The link to reset the password
 * @param apiKey - The API key to use for sending the email
 *
 * @returns The ID of the sent email
 * @throws An error if the email could not be sent
 */
export async function sendPasswordResetEmail({ from, to, name, link, apiKey }: PasswordResetMailOptions) {
    const resend = createResend(apiKey);

    const resp = await resend.emails.send({
        to,
        from,
        subject: "Passwort zurücksetzen",
        react: PasswordResetTemplate({ name, link }),
    });

    if (resp.error) {
        throw new Error(resp.error.message);
    }

    return resp.data?.id;
}

type PasswordChangedMailOptions = MailOptions & { to: string; name: string };

/**
 * Send a password changed email
 *
 * @param to - The email to send the reset link to
 * @param name - The name of the user
 * @param apiKey - The API key to use for sending the email
 *
 * @returns The ID of the sent email
 * @throws An error if the email could not be sent
 */
export async function sendPasswordChangedEmail({ from, to, name, apiKey }: PasswordChangedMailOptions) {
    const resend = createResend(apiKey);

    const resp = await resend.emails.send({
        to,
        from,
        subject: "Passwort geändert",
        react: PasswordChangedTemplate({ name }),
    });

    if (resp.error) {
        throw new Error(resp.error.message);
    }

    return resp.data?.id;
}
