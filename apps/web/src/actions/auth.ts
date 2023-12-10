"use server";

import "server-only";

import { signIn, signOut } from "@/lib/auth/auth";
import type { signupSchema, forgotSchema, resetSchema } from "@/lib/schema/auth";
import * as bcrypt from "bcryptjs";
import type { z } from "zod";

import { createUser, getUserByMail, type CreateUserType, getToken, deleteToken } from "@energyleaf/db/query";
import {randomBytes} from "crypto";
import {SendMail} from "@/lib/mail/sendgrid"

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

export async function forgotPassword(data: z.infer<typeof forgotSchema>) {
    const { mail } = data;

    const user = await getUserByMail(mail);
    if (!user) {
        throw new Error("E-Mail wird nicht verwendet.");
    }

    const uuid = randomBytes(20).toString("hex");

    // todo: speichere in datenbank

    await SendMail(mail, "Energyleaf: Passwort zurückseten", "test")
}

export async function resetPassword(data: z.infer<typeof resetSchema>, token_id: string | null) {
    const { password, passwordRepeat } = data;

    const token = await getToken(token_id);
    if (token === null) {
        throw new Error("Ungültiges oder abgelaufenes Passwort-Reset-Token");
    }

    token.created.setHours(token.created.getHours() + 1);
    if (token.created < new Date()) {
        await deleteToken(token.tokenId);
        throw new Error("Ungültiges oder abgelaufenes Passwort-Reset-Token");
    }

    if (password !== passwordRepeat) {
        throw new Error("Passwörter stimmen nicht überein.");
    }

    // todo: update password

    await deleteToken(token.tokenId);
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

/**
 * Server action to sign a user out
 */
export async function signOutAction() {
    await signOut();
}

export async function searchForToken(token_id : string | null) {
    if (token_id === null) {
        return null
    }
    return await getToken(token_id);
}
