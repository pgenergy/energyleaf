import { env } from "@/env.mjs";
import { cookies } from "next/headers";

export async function setSessionTokenCookie(token: string, expiresAt: Date): Promise<void> {
    const cookieStore = cookies();
    cookieStore.set("auth_session", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: env.VERCEL_ENV === "production" || env.VERCEL_ENV === "preview",
        expires: expiresAt,
        path: "/",
    });
}

export async function deleteSessionTokenCookie(): Promise<void> {
    const cookieStore = cookies();
    cookieStore.set("auth_session", "", {
        httpOnly: true,
        sameSite: "lax",
        secure: env.VERCEL_ENV === "production" || env.VERCEL_ENV === "preview",
        maxAge: 0,
        path: "/",
    });
}
