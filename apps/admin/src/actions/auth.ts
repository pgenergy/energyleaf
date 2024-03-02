"use server";

import type { signInSchema } from "@/lib/schema/auth";

import "server-only";

import { redirect } from "next/navigation";
import { env } from "@/env.mjs";
import type { z } from "zod";

import { getUserById, getUserByMail } from "@energyleaf/db/query";
import { Argon2id } from "oslo/password";
import { UserNotActiveError, buildResetPasswordUrl, getResetPasswordToken } from "@energyleaf/lib";
import { sendPasswordResetMailForUser } from "@energyleaf/mail";
import { getSession, lucia } from "@/lib/auth/auth";
import { cookies } from "next/headers";

export async function signInAction(data: z.infer<typeof signInSchema>) {
    const { session } = await getSession();
    if (session) {
        redirect("/dashboard");
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

    const passwordMatch = await new Argon2id().verify(user.password, data.password);
    if (!passwordMatch) {
        throw new Error("E-Mail oder Passwort falsch.");
    }

    const newSession = await lucia.createSession(user.id, user);
    const cookie = lucia.createSessionCookie(newSession.id);
    cookies().set(cookie.name, cookie.value, cookie.attributes);
    redirect("/");
}

export async function signOutAction() {
    const { session } = await getSession();
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
