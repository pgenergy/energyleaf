import { env } from "@/env";
import { Resend } from "resend";
import "server-only";
import { EMailEnabled } from "./check";

export const getResendClient = () => {
	if (EMailEnabled()) {
		return new Resend(env.RESEND_API_KEY);
	} else {
		return null;
	}
};

export async function sendAccountCreatedMail() {
	const client = getResendClient();
	if (!client) {
		return;
	}

	return;
}
