"use server";

import type { signInSchema } from "@/lib/schema/auth";

import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/env.mjs";
import { getActionSession } from "@/lib/auth/auth.action";
import { lucia } from "@/lib/auth/auth.config";
import { Argon2id, Bcrypt } from "oslo/password";
import type { z } from "zod";

import { getUserById, getUserByMail, updatePassword } from "@energyleaf/db/query";
import { buildResetPasswordUrl, getResetPasswordToken, UserNotActiveError } from "@energyleaf/lib";
import { sendPasswordResetMailForUser } from "@energyleaf/mail";

export async function signInAction(data: z.infer<typeof signInSchema>) {
    const { session } = await getActionSession();
    if (session) {
        redirect("/");
    }

    const user = await getUserByMail(data.email);
    if (!user) {
        throw new Error("E-Mail oder Passwort falsch.");
    }

    if (!user.isActive) {
        throw new UserNotActiveError();
    }

    if (!user.isAdmin) {
        throw new Error("Keine Berechtigung.");
    }

    const argonMatch = await new Argon2id().verify(user.password, data.password);
    if (!argonMatch) {
        const bcryptMatch = await new Bcrypt().verify(user.password, data.password);
        if (!bcryptMatch) {
            throw new Error("E-Mail oder Passwort falsch.");
        } else {
            const hash = await new Argon2id().hash(data.password);
            await updatePassword({ password: hash }, user.id); 
        }
    }

    const newSession = await lucia.createSession(user.id, {});
    const cookie = lucia.createSessionCookie(newSession.id);
    cookies().set(cookie.name, cookie.value, cookie.attributes);
    redirect("/");
}

export async function signOutAction() {
    const { session } = await getActionSession();
    if (!session) {
        return;
    }

    await lucia.invalidateSession(session.id);
    redirect("/auth");
}

export async function resetUserPassword(userId: string) {
    const user = await getUserById(userId);
    if (!user) {
        throw new Error("User nicht gefunden.");
    }

    const token = await getResetPasswordToken({
        userId: user.id,
        secret: env.NEXTAUTH_SECRET,
    });
    const resetUrl = buildResetPasswordUrl({ env, token });

    try {
        await sendPasswordResetMailForUser({
            from: env.RESEND_API_MAIL,
            to: user.email,
            name: user.username,
            link: resetUrl,
            apiKey: env.RESEND_API_KEY,
        });
    } catch (err) {
        throw new Error("Fehler beim Senden der E-Mail.");
    }
}
