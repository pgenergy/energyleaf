import * as jose from "jose";

interface ResetPasswordTokenOptions {
    userId: number;
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

interface ResetPasswordEmailParams {
    env: {
        VERCEL_URL?: string;
        NEXTAUTH_URL?: string;
    };
    token: string;
}

export function buildResetPasswordUrl({ env, token }: ResetPasswordEmailParams) {
    return `https://${env.VERCEL_URL || env.NEXTAUTH_URL || "energyleaf.de"}/reset?token=${token}`;
}