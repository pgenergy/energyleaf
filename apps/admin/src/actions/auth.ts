"use server";

import { isRedirectError } from "next/dist/client/components/redirect";
import { signIn, signOut } from "@/lib/auth/auth";
import type { signInSchema } from "@/lib/schema/auth";

import "server-only";

import { redirect } from "next/navigation";
import type { z } from "zod";
import {sendPasswordResetMailForUser} from "@energyleaf/mail";
import {env} from "@/env.mjs";
import {getUserById} from "@energyleaf/db/query";
import {buildResetPasswordUrl, getResetPasswordToken} from "@energyleaf/lib";

export async function signInAction(data: z.infer<typeof signInSchema>) {
    try {
        await signIn("credentials", {
            email: data.email,
            password: data.password,
        });
    } catch (err) {
        if (isRedirectError(err)) {
            redirect("/");
        }

        return {
            message: "Benutzername oder Passwort falsch",
        };
    }
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
    const resetUrl = buildResetPasswordUrl({env,  token})

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
