import * as jose from "jose";

interface ResetPasswordTokenOptions {
    userId: string;
    secret: string;
}

export async function getResetPasswordToken({ userId, secret }: ResetPasswordTokenOptions) {
    return await new jose.SignJWT()
        .setSubject(userId.toString())
        .setIssuedAt()
        .setExpirationTime("1h")
        .setAudience("energyleaf")
        .setIssuer("energyleaf")
        .setNotBefore(new Date())
        .setProtectedHeader({ alg: "HS256" })
        .sign(Buffer.from(secret, "hex"));
}

interface EmailAuthParams {
    baseUrl: string;
    token: string;
}

interface ResetPasswordEmailParams {
    baseUrl: string;
    token: string;
}

export function buildResetPasswordUrl({ baseUrl, token }: ResetPasswordEmailParams) {
    return `https://${baseUrl}/reset?token=${token}`;
}

export function buildUnsubscribeUrl({ baseUrl, token }: EmailAuthParams) {
    return `https://${baseUrl}/unsubscribe?token=${token}`;
}
