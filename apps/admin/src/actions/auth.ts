"use server";

import { env } from "@/env.mjs";
import { checkIfAdmin, getActionSession } from "@/lib/auth/auth.action";
import { setSessionTokenCookie } from "@/lib/auth/session";
import type { signInSchema } from "@/lib/schema/auth";
import { UserNotActiveError, buildResetPasswordUrl, getResetPasswordToken } from "@energyleaf/lib";
import { sendPasswordResetMailForUser } from "@energyleaf/mail";
import { logError, trackAction } from "@energyleaf/postgres/query/logs";
import { getUserById, getUserByMail } from "@energyleaf/postgres/query/user";
import { waitUntil } from "@vercel/functions";
import { redirect } from "next/navigation";
import "server-only";
import { createSession, generateSessionToken, invalidateSession } from "@energyleaf/postgres/query/auth";
import { verify as argonVerify } from "@node-rs/argon2";
import type { z } from "zod";

export async function signInAction(data: z.infer<typeof signInSchema>) {
    const { session } = await getActionSession();
    if (session) {
        redirect("/");
    }
    try {
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

        let match = false;

        try {
            match = await argonVerify(user.password, data.password);
        } catch (err) {
            match = false;
        }

        if (!match) {
            throw new Error("E-Mail oder Passwort falsch.");
        }

        try {
            const token = generateSessionToken();
            const newSession = await createSession(token, user.id);
            setSessionTokenCookie(token, newSession.expiresAt);
        } catch (err) {
            throw new Error("Fehler beim Erstellen der Sitzung.");
        }
    } catch (err) {
        return {
            success: false,
            message: err.message,
        };
    }
    redirect("/");
}

export async function signOutAction() {
    const { session } = await getActionSession();
    if (!session) {
        return;
    }

    try {
        await invalidateSession(session.id);
    } catch (err) {
        return {
            success: false,
            message: "Abmeldung fehlgeschlagen.",
        };
    }
    redirect("/auth");
}

export async function resetUserPassword(userId: string) {
    try {
        await checkIfAdmin();
    } catch (err) {
        return {
            success: false,
            message: "Keine Berechtigung.",
        };
    }

    const user = await getUserById(userId);
    if (!user) {
        return {
            success: false,
            message: "Nutzer nicht gefunden.",
        };
    }

    try {
        const token = await getResetPasswordToken({
            userId: user.id,
            secret: env.HASH_SECRET,
        });

        const resetUrl = buildResetPasswordUrl({ baseUrl: env.NEXT_PUBLIC_APP_URL, token });

        try {
            if (env.RESEND_API_KEY && env.RESEND_API_MAIL) {
                await sendPasswordResetMailForUser({
                    from: env.RESEND_API_MAIL,
                    to: user.email,
                    name: user.username,
                    link: resetUrl,
                    apiKey: env.RESEND_API_KEY,
                });
                waitUntil(
                    trackAction("pasword/reset-mail-sent", "admin-password-reset", "admin", {
                        userId: user.id,
                    }),
                );
            }
        } catch (err) {
            waitUntil(
                logError(
                    "password/admin-reset-mail-failed",
                    "admin-password-reset",
                    "admin",
                    {
                        userId: user.id,
                    },
                    err,
                ),
            );
            return {
                success: false,
                message: "Fehler beim senden der E-Mail.",
            };
        }
    } catch (err) {
        return {
            success: false,
            message: "Fehler beim erstellen des Token.",
        };
    }
}
