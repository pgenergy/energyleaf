"use server";

import { getActionSession } from "@/lib/auth/auth.action";
import { logError, trackAction, updateUser } from "@energyleaf/db/query";
import { UserNotLoggedInError } from "@energyleaf/lib";
import { redirect } from "next/navigation";
import "server-only";
import { waitUntil } from "@vercel/functions";
import type { Session } from "lucia";

export async function completeOnboarding() {
    let session: Session | undefined = undefined;
    try {
        session = (await getActionSession())?.session as Session;
        if (!session) {
            throw new UserNotLoggedInError();
        }

        await updateUser({ onboardingCompleted: true }, session.userId);
        waitUntil(trackAction("user/update-onboarding-completed", "complete-onboarding", "web", { session }));
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            waitUntil(logError("user/not-logged-in", "complete-onboarding", "web", {}, err));
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um das Onboarding abzuschließen.",
            };
        }
        waitUntil(logError("onboarding/error", "complete-onboarding", "web", {}, err));
        return {
            success: false,
            message: "Ein Fehler beim Onboarding.",
        };
    }
    redirect("/dashboard");
}
