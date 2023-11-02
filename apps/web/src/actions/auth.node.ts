"use server";

import "server-only";

import { signIn } from "@/lib/auth/auth";
import type { signupSchema } from "@/lib/schema/auth";
import * as bcrypt from "bcryptjs";
import type { z } from "zod";

import { createUser, getUserByMail, type CreateUserType } from "@energyleaf/db/query";

/**
 * Server action for creating a new account
 */
export async function createAccount(data: z.infer<typeof signupSchema>) {
    const { mail, password, passwordRepeat, sensorId, username } = data;

    if (password !== passwordRepeat) {
        throw new Error("Passwörter stimmen nicht überein.");
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
            sensorId,
            username,
        } satisfies CreateUserType);
    } catch (_err) {
        throw new Error("Fehler beim Erstellen des Accounts.");
    }
}

/**
 * Server action to sign a user in
 */
export async function signInAction(email: string, password: string) {
    await signIn("credentials", {
        email,
        password,
    });
}
