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
    env: {
        VERCEL_URL?: string;
        NEXTAUTH_URL?: string;
    };
    token: string;
}

export function buildResetPasswordUrl({ env, token }: EmailAuthParams) {
    return `https://${env.VERCEL_URL || env.NEXTAUTH_URL || "energyleaf.de"}/reset?token=${token}`;
}

export function buildUnsubscribeReportsUrl({ env, token }: EmailAuthParams) {
    return `https://${env.VERCEL_URL || env.NEXTAUTH_URL || "energyleaf.de"}/unsubscribe?token=${token}`;
}