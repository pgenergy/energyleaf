import { env } from "@/env";

export function S3Enabled() {
	if (!env.S3_REGION || !env.S3_ENDPOINT || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY) {
		return false;
	}
	return true;
}

export function EMailEnabled() {
	if (!env.RESEND_API_MAIL || !env.RESEND_API_KEY) {
		return false;
	}

	return true;
}

export function ExperimentMode() {
	if (env.DISABLE_EXPERIMENT) {
		return false;
	}

	return true;
}
