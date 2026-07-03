import "server-only";

import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import { env } from "@/env";
import PasswordChangedTemplate from "@/mail/templates/password-changed";
import PasswordResetTemplate from "@/mail/templates/password-reset";
import { NodemailerEnabled } from "./check";

export const getMailClient = () => {
	if (!NodemailerEnabled()) return null;
	return nodemailer.createTransport({
		host: env.NODEMAILER_ENDPOINT,
		port: env.NODEMAILER_PORT,
		secure: false,
	});
};

function getBaseUrl(): string {
	// vercel production deployment, from vercel()
	if (env.VERCEL_PROJECT_PRODUCTION_URL) {
		return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
	}
	
	//vercel staging
	if (env.VERCEL_URL) { 
		return `https://${env.VERCEL_URL}`;
	}
	
	//local development, from process
	if (process.env.NODE_ENV === "development") { 
		return "http://localhost:3000";
	}
	return "https://energyleaf.de" //self-hosted; needs domain forwarding
}

interface SendPasswordResetMailParams {
	email: string;
	name: string;
	resetToken: string;
}

export async function sendPasswordResetMail({ email, name, resetToken }: SendPasswordResetMailParams) {
	const client = getMailClient();
	if (!client || !env.NODEMAILER_MAIL) {
		return;
	}

	const baseUrl = getBaseUrl();
	const resetUrl = `${baseUrl}/forgot?token=${resetToken}`;

	await client.sendMail({
		from: env.NODEMAILER_MAIL,
		to: email,
		subject: "Energyleaf - Passwort zurücksetzen",
		html: await render(PasswordResetTemplate({ name, resetUrl, url: baseUrl })),
	});
}

interface SendPasswordChangedMailParams {
	email: string;
	name: string;
}

export async function sendPasswordChangedMail({ email, name }: SendPasswordChangedMailParams) {
	const client = getMailClient();
	if (!client || !env.NODEMAILER_MAIL) {
		return;
	}

	const baseUrl = getBaseUrl();

	await client.sendMail({
		from: env.NODEMAILER_MAIL,
		to: email,
		subject: "Energyleaf - Passwort geändert",
		html: await render(PasswordChangedTemplate({ name, url: baseUrl })),
	});
}

export async function sendAccountCreatedMail() {
/*
	const client = getResendClient();
	if (!client) {
		return;
	}
*/
	return;
}
