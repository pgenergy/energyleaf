import "server-only";

import { Resend } from "resend";
import { env } from "@/env";
import PasswordChangedTemplate from "@/mail/templates/password-changed";
import PasswordResetTemplate from "@/mail/templates/password-reset";
import { EMailEnabled } from "./check";

export const getResendClient = () => {
	if (EMailEnabled()) {
		return new Resend(env.RESEND_API_KEY);
	}
	return null;
};

function getBaseUrl(): string {
	if (env.VERCEL_PROJECT_PRODUCTION_URL) {
		return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
	}
	return "https://app.energyleaf.de";
}

interface SendPasswordResetMailParams {
	email: string;
	name: string;
	resetToken: string;
}

export async function sendPasswordResetMail({ email, name, resetToken }: SendPasswordResetMailParams) {
	const client = getResendClient();
	if (!client || !env.RESEND_API_MAIL) {
		return;
	}

	const baseUrl = getBaseUrl();
	const resetUrl = `${baseUrl}/forgot?token=${resetToken}`;

	await client.emails.send({
		from: env.RESEND_API_MAIL,
		to: email,
		subject: "Energyleaf - Passwort zurücksetzen",
		react: PasswordResetTemplate({ name, resetUrl, url: baseUrl }),
	});
}

interface SendPasswordChangedMailParams {
	email: string;
	name: string;
}

export async function sendPasswordChangedMail({ email, name }: SendPasswordChangedMailParams) {
	const client = getResendClient();
	if (!client || !env.RESEND_API_MAIL) {
		return;
	}

	const baseUrl = getBaseUrl();

	await client.emails.send({
		from: env.RESEND_API_MAIL,
		to: email,
		subject: "Energyleaf - Passwort geändert",
		react: PasswordChangedTemplate({ name, url: baseUrl }),
	});
}

export async function sendAccountCreatedMail() {
	const client = getResendClient();
	if (!client) {
		return;
	}

	return;
}
