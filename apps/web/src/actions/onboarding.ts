"use server";

import "server-only";

import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {createUserData} from "@energyleaf/db/query";
import { getActionSession } from "@/lib/auth/auth.action";
import {UserNotLoggedInError} from "@energyleaf/lib";

export async function completeOnboarding() {
    const { session } = await getActionSession();
    if (!session) {
        throw new UserNotLoggedInError();
    }

    // await createUserData(session.userId);
    cookies().set("onboarding_complete", "true");
    redirect("/dashboard");
}