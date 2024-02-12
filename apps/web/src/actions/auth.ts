"use server";

import "server-only";

import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/env.mjs";
import { signIn, signOut } from "@/lib/auth/auth";
import { isDemoUser } from "@/lib/demo/demo";
import type { forgotSchema, resetSchema, signupSchema } from "@/lib/schema/auth";
import * as bcrypt from "bcryptjs";
import * as jose from "jose";
import type { z } from "zod";

import { createUser, getUserById, getUserByMail, updatePassword, type CreateUserType } from "@energyleaf/db/query";
import { sendPasswordChangedEmail, sendPasswordResetEmail } from "@energyleaf/mail";

/**
 * Server action for creating a new account
 */
export async function createAccount(data: z.infer<typeof signupSchema>) {
    const { mail, password, passwordRepeat, username } = data;

    if (mail === "demo@energyleaf.de") {
        throw new Error("Demo-Account kann nicht erstellt werden.");
    }

    if (password !== passwordRepeat) {
        throw new Error("Passwörter stimmen nicht überein.");
    }

    if (mail.length >= 256) {
        throw new Error("E-Mail muss unter dem Zeichenlimit von 256 Zeichen liegen.");
    }
    if (username.length >= 30) {
        throw new Error("Benutzername muss unter dem Zeichenlimit von 30 Zeichen liegen.");
    }
    if (password.length >= 256) {
        throw new Error("Passwort muss unter dem Zeichenlimit von 256 Zeichen liegen.");
    }

    const user = await getUserByMail(mail);
    if (user) {
        throw new Error("E-Mail wird bereits verwendet.");
    }

    const hash = await bcrypt.hash(password, 10);

    try {
        await createUser({
            email: mail,
            password: hash,
            username,
        } satisfies CreateUserType);
    } catch (_err) {
        throw new Error("Fehler beim Erstellen des Accounts.");
    }
}

export async function forgotPassword(data: z.infer<typeof forgotSchema>) {
    const { mail } = data;

    if (mail === "demo@energyleaf.de") {
        throw new Error("Demo-Account kann nicht zurückgesetzt werden.");
    }

    const user = await getUserByMail(mail);
    if (!user) {
        throw new Error("E-Mail wird nicht verwendet.");
    }

    const token = await new jose.SignJWT()
        .setSubject(user.id.toString())
        .setIssuedAt()
        .setExpirationTime("1h")
        .setAudience("energyleaf")
        .setIssuer("energyleaf")
        .setNotBefore(new Date())
        .setProtectedHeader({ alg: "HS256" })
        .sign(Buffer.from(env.NEXTAUTH_SECRET, "hex"));

    const resetUrl = `https://${env.VERCEL_URL || env.NEXTAUTH_URL || "energyleaf.de"}/reset?token=${token}`;
    try {
        await sendPasswordResetEmail({
            from: env.RESEND_API_MAIL,
            to: mail,
            name: user.username,
            link: resetUrl,
            apiKey: env.RESEND_API_KEY,
        });
    } catch (err) {
        throw new Error("Fehler beim Senden der E-Mail.");
    }
}

export async function resetPassword(data: z.infer<typeof resetSchema>, resetToken: string) {
    const { password: newPassword, passwordRepeat } = data;

    if (newPassword !== passwordRepeat) {
        throw new Error("Passwörter stimmen nicht überein.");
    }

    const { sub } = jose.decodeJwt(resetToken);
    const user = await getUserById(Number(sub));

    if (!user) {
        throw new Error("Ungültiges oder abgelaufenes Passwort-Reset-Token");
    }

    await jose.jwtVerify(resetToken, Buffer.from(env.NEXTAUTH_SECRET, "hex"), {
        audience: "energyleaf",
        issuer: "energyleaf",
        algorithms: ["HS256"],
    });
    // no exception was thrown, so everything is fine

    const hash = await bcrypt.hash(newPassword, 10);
    await updatePassword({ password: hash }, user.id);

    try {
        await sendPasswordChangedEmail({
            from: env.RESEND_API_MAIL,
            to: user.email,
            name: user.username,
            apiKey: env.RESEND_API_KEY,
        });
    } catch (err) {
        throw new Error("Fehler beim Senden der E-Mail.");
    }
}

/**
 * Server action to sign a user in
 */
export async function signInAction(email: string, password: string) {
    try {
        await signIn("credentials", {
            email,
            password,
        });
    } catch (err: unknown) {
        if (isRedirectError(err)) {
            return redirect("/dashboard");
        }

        throw new Error("Benutername oder Passwort falsch.");
    }
}

/**
 * Server action to sign a user out
 */
export async function signOutAction() {
    if (await isDemoUser()) {
        const cookieStore = cookies();
        cookieStore.delete("demo_devices");
        cookieStore.delete("demo_peaks");
    }

    await signOut();
}
