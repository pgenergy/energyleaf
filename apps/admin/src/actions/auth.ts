"use server";

import { signIn, signOut } from "@/lib/auth/auth";
import type { signInSchema } from "@/lib/schema/auth";

import "server-only";

import { redirect } from "next/navigation";
import type { z } from "zod";
import { AuthError } from "next-auth";

export async function signInAction(data: z.infer<typeof signInSchema>) {
    try {
        await signIn("credentials", {
            email: data.email,
            password: data.password,
        });
    } catch (err) {
        if (err instanceof AuthError) {
            switch (err.type) {
                case 'CredentialsSignin':
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
