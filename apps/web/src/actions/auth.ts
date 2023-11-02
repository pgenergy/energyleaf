"use server";

import "server-only";

import { signOut } from "@/lib/auth/auth.config";

/**
 * Server action to sign a user out
 */
export async function signOutAction() {
    await signOut();
}
