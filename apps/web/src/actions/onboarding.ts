"use server";

import "server-only";

import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import { getActionSession } from "@/lib/auth/auth.action";
import {UserNotLoggedInError} from "@energyleaf/lib";
import {updateUser} from "@energyleaf/db/query";

export async function completeOnboarding() {
    const { session } = await getActionSession();
    if (!session) {
        throw new UserNotLoggedInError();
    }

    await updateUser(
        { onboardingCompleted: true },
        session.userId
    );
    cookies().set("onboarding_complete", "true");
    redirect("/dashboard");
}