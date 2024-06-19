"use server";

import { env } from "@/env.mjs";
import { checkIfAdmin, getActionSession } from "@/lib/auth/auth.action";
import { lucia } from "@/lib/auth/auth.config";
import type { signInSchema } from "@/lib/schema/auth";
import { getUserById, getUserByMail, logError, trackAction, updatePassword } from "@energyleaf/db/query";
import { UserNotActiveError, buildResetPasswordUrl, getResetPasswordToken } from "@energyleaf/lib";
import { sendPasswordResetMailForUser } from "@energyleaf/mail";
import { waitUntil } from "@vercel/functions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Argon2id, Bcrypt } from "oslo/password";
import "server-only";
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
            match = await new Argon2id().verify(user.password, data.password);
        } catch (err) {
            match = await new Bcrypt().verify(user.password, data.password);
            if (!match) {
                throw new Error("E-Mail oder Passwort falsch.");
            }

            const hash = await new Argon2id().hash(data.password);
            await updatePassword({ password: hash }, user.id);
        }

        if (!match) {
            throw new Error("E-Mail oder Passwort falsch.");
        }

        try {
            const newSession = await lucia.createSession(user.id, {});
            const cookie = lucia.createSessionCookie(newSession.id);
            cookies().set(cookie.name, cookie.value, cookie.attributes);
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
        await lucia.invalidateSession(session.id);
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

        const resetUrl = buildResetPasswordUrl({ baseUrl: env.APP_URL, token });

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
