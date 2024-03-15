// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- This is a React file
import * as React from "react";
import { Resend } from "resend";

import AccountActivatedTemplate from "../templates/account-activated";
import AccountCreatedTemplate from "../templates/account-created";
import PasswordChangedTemplate from "../templates/password-changed";
import PasswordResetTemplate from "../templates/password-reset";
import PasswordResetByAdminTemplate from "../templates/password-reset-by-admin";

interface MailOptions {
    apiKey: string;
    from: string;
    to: string;
}

/**
 * Create a new Resend instance
 * internal use only
 */
function createResend(apiKey: string) {
    return new Resend(apiKey);
}

interface PasswordResetMailOptions extends MailOptions {
    name: string;
    link: string;
}

/**
 * Send a password reset email
 *
 * @param from - The email to send the reset link from
 * @param to - The email to send the reset link to
 * @param name - The name of the user
 * @param link - The link to reset the password
 * @param apiKey - The API key to use for sending the email
 *
 * @returns The ID of the sent email
 * @throws An error if the email could not be sent
 */
export async function sendPasswordResetEmail({ from, to, name, link, apiKey }: PasswordResetMailOptions) {
    return sendPasswordResetMailByTemplate({ from, to, apiKey }, PasswordResetTemplate({ name, link }));
}

/**
 * Send a password reset email initiated by an admin
 *
 * @param from - The email to send the reset link from
 * @param to - The email to send the reset link to
 * @param name - The name of the user
 * @param link - The link to reset the password
 * @param apiKey - The API key to use for sending the email
 *
 * @returns The ID of the sent email
 * @throws An error if the email could not be sent
 */
export async function sendPasswordResetMailForUser({ from, to, name, link, apiKey }: PasswordResetMailOptions) {
    return sendPasswordResetMailByTemplate({ from, to, apiKey }, PasswordResetByAdminTemplate({ name, link }));
}

async function sendPasswordResetMailByTemplate({ from, to, apiKey }: MailOptions, template: React.JSX.Element) {
    const resend = createResend(apiKey);

    const resp = await resend.emails.send({
        to,
        from,
        subject: "Passwort zurücksetzen",
        react: template,
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
 * @param from - The email to send the reset link from
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

type AccountCreatedMailOptions = PasswordChangedMailOptions;

/**
 * Send an account created email
 *
 * @param from - The email to send the reset link from
 * @param to - The email to send the reset link to
 * @param name - The name of the user
 * @param apiKey - The API key to use for sending the email
 *
 * @returns The ID of the sent email
 * @throws An error if the email could not be sent
 */
export async function sendAccountCreatedEmail({ from, to, name, apiKey }: AccountCreatedMailOptions) {
    const resend = createResend(apiKey);

    const resp = await resend.emails.send({
        to,
        from,
        subject: "Konto erstellt",
        react: AccountCreatedTemplate({ name }),
    });

    if (resp.error) {
        throw new Error(resp.error.message);
    }

    return resp.data?.id;
}

type AccountActivatedMailOptions = PasswordChangedMailOptions;

/**
 * Send an account activated email
 *
 * @param from - The email to send the reset link from
 * @param to - The email to send the reset link to
 * @param name - The name of the user
 * @param apiKey - The API key to use for sending the email
 *
 * @returns The ID of the sent email
 * @throws An error if the email could not be sent
 */
export async function sendAccountActivatedEmail({ from, to, name, apiKey }: AccountActivatedMailOptions) {
    const resend = createResend(apiKey);

    const resp = await resend.emails.send({
        to,
        from,
        subject: "Konto aktiviert",
        react: AccountActivatedTemplate({ name }),
    });

    if (resp.error) {
        throw new Error(resp.error.message);
    }

    return resp.data?.id;
}
