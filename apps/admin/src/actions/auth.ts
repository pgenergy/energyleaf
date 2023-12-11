"use server";

import { isRedirectError } from "next/dist/client/components/redirect";
import { signIn } from "@/lib/auth/auth";
import type { signInSchema } from "@/lib/schema/auth";

import "server-only";

import { redirect } from "next/navigation";
import type { z } from "zod";

export default async function signInAction(data: z.infer<typeof signInSchema>) {
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
