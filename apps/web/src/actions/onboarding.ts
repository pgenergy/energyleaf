"use server";

import { getActionSession } from "@/lib/auth/auth.action";
import { updateUser } from "@energyleaf/db/query";
import { UserNotLoggedInError } from "@energyleaf/lib";
import { redirect } from "next/navigation";
import "server-only";

export async function completeOnboarding() {
    try {
        const { session } = await getActionSession();
        if (!session) {
            throw new UserNotLoggedInError();
        }

        await updateUser({ onboardingCompleted: true }, session.userId);
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um das Onboarding abzuschließen.",
            };
        }

        return {
            success: false,
            message: "Ein Fehler beim Onboarding.",
        };
    }
    redirect("/dashboard");
}
