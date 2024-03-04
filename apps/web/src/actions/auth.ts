"use server";

import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/env.mjs";
import { getActionSession } from "@/lib/auth/auth.action";
import { lucia } from "@/lib/auth/auth.config";
import { getDemoUserData, isDemoUser } from "@/lib/demo/demo";
import type { forgotSchema, resetSchema, signupSchema } from "@/lib/schema/auth";
import * as jose from "jose";
import { Argon2id, Bcrypt } from "oslo/password";
import type { z } from "zod";

import { createUser, getUserById, getUserByMail, updatePassword, type CreateUserType } from "@energyleaf/db/query";
import { buildResetPasswordUrl, getResetPasswordToken, UserNotActiveError } from "@energyleaf/lib";
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

    const hash = await new Argon2id().hash(password);

    try {
        await createUser({
            email: mail,
            password: hash,
            username,
        } satisfies CreateUserType);
    } catch (_err) {
        throw new Error("Fehler beim Erstellen des Accounts.");
    }
    redirect("/created");
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

    const token = await getResetPasswordToken({ userId: user.id, secret: env.NEXTAUTH_SECRET });
    const resetUrl = buildResetPasswordUrl({ env, token });

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
    if (!sub) {
        throw new Error("Ungültiges oder abgelaufenes Passwort-Reset-Token");
    }

    const user = await getUserById(sub);

    if (!user) {
        throw new Error("Ungültiges oder abgelaufenes Passwort-Reset-Token");
    }

    await jose.jwtVerify(resetToken, Buffer.from(env.NEXTAUTH_SECRET, "hex"), {
        audience: "energyleaf",
        issuer: "energyleaf",
        algorithms: ["HS256"],
    });
    // no exception was thrown, so everything is fine

    const hash = await new Argon2id().hash(newPassword);
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
    const { session } = await getActionSession();
    if (session) {
        redirect("/dashboard");
    }

    const user = await getUserByMail(email);
    if (!user) {
        throw new Error("E-Mail oder Passwort falsch.");
    }

    if (!user.isActive) {
        throw new UserNotActiveError();
    }

    const argonMatch = await new Argon2id().verify(user.password, password);
    if (!argonMatch) {
        const bcryptMatch = await new Bcrypt().verify(user.password, password);
        if (!bcryptMatch) {
            throw new Error("E-Mail oder Passwort falsch.");
        } else {
            const hash = await new Argon2id().hash(password);
            await updatePassword({ password: hash }, user.id); 
        }
    }


    const newSession = await lucia.createSession(user.id, {});
    const cookie = lucia.createSessionCookie(newSession.id);
    cookies().set(cookie.name, cookie.value, cookie.attributes);
    redirect("/dashboard");
}

/**
 * Server action to sign a user in as demo
 */
export async function signInDemoAction() {
    const { session } = await getActionSession();
    if (session) {
        redirect("/dashboard");
    }

    const cookieStore = cookies();

    cookieStore.set("demo_mode", "true");
    cookieStore.set("demo_data", JSON.stringify(getDemoUserData()));
    redirect("/dashboard");
}

/**
 * Server action to sign a user out
 */
export async function signOutAction() {
    const { session } = await getActionSession();
    if (!session) {
        return;
    }

    await lucia.invalidateSession(session.id);
    redirect("/");
}

export async function signOutDemoAction() {
    if (!await isDemoUser()) {
        throw new Error("Not a demo user");
    }
    const cookieStore = cookies();
    cookieStore.delete("demo_data");
    cookieStore.delete("demo_devices");
    cookieStore.delete("demo_peaks");
    cookieStore.delete("demo_mode");
    redirect("/");
}
