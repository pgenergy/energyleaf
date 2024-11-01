import { Versions } from "@energyleaf/lib/versioning";
import { cookies } from "next/headers";
import "server-only";
import { type SessionValidationResult, validateSessionToken } from "@energyleaf/postgres/query/auth";
import { redirect } from "next/navigation";

export const getActionSession = async (): Promise<SessionValidationResult> => {
    const demoMode = cookies().get("demo_mode")?.value === "true";
    if (demoMode) {
        return {
            user: {
                id: "demo",
                username: "Demo Nutzer",
                firstname: "Demo",
                lastname: "Nutzer",
                password: "",
                email: "demo@energyleaf.de",
                phone: null,
                address: "Ammerländer Heerstraße 114, Oldenburg",
                created: new Date(),
                activationDate: new Date(),
                isParticipant: true,
                receiveAnomalyMails: true,
                isAdmin: false,
                isActive: true,
                appVersion: Versions.support as number,
                onboardingCompleted: true,
            },
            session: {
                id: "demo",
                userId: "demo",
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            },
        };
    }
    const token = cookies().get("auth_session")?.value ?? null;
    if (!token) {
        return {
            user: null,
            session: null,
        };
    }

    try {
        const result = await validateSessionToken(token);
        if (result.session && result.user) {
            return result;
        }
    } catch {
        // ignore
    }
    cookies().delete("auth_session");
    redirect("/");
};
