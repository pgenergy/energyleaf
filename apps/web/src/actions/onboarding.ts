"use server";

import { getActionSession } from "@/lib/auth/auth.action";
import { UserNotLoggedInError } from "@energyleaf/lib";
import { log, logError, trackAction } from "@energyleaf/postgres/query/logs";
import { updateUser } from "@energyleaf/postgres/query/user";
import { redirect } from "next/navigation";
import "server-only";
import { waitUntil } from "@vercel/functions";
import type { Session } from "lucia";

export async function completeOnboarding() {
    let session: Session | null = null;
    try {
        session = (await getActionSession())?.session;
        if (!session) {
            waitUntil(log("user/not-logged-in", "error", "complete-onboarding", "web", {}));
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
