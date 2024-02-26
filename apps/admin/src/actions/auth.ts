"use server";

import { signIn, signOut } from "@/lib/auth/auth";
import type { signInSchema } from "@/lib/schema/auth";

import "server-only";

import { redirect } from "next/navigation";
import { env } from "@/env.mjs";
import { AuthError } from "next-auth";
import type { z } from "zod";

import { getUserById } from "@energyleaf/db/query";
import { buildResetPasswordUrl, getResetPasswordToken } from "@energyleaf/lib";
import { sendPasswordResetMailForUser } from "@energyleaf/mail";

export async function signInAction(data: z.infer<typeof signInSchema>) {
    try {
        await signIn("credentials", {
            email: data.email,
            password: data.password,
        });
    } catch (err) {
        if (err instanceof AuthError) {
            switch (err.type) {
                case "CredentialsSignin":
                    return {
                        message: "E-Mail oder Passwort falsch",
                    };
                default:
                    return {
                        message: "Fehler beim Anmelden",
                    };
            }
        }

        throw err;
    }

    redirect("/dashboard");
}

export async function signOutAction() {
    await signOut();
}

export async function resetUserPassword(userId: number) {
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
