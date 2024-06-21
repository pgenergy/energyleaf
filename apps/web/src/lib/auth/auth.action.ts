import { Versions } from "@energyleaf/lib/versioning";
import { cookies } from "next/headers";
import "server-only";
import { redirect } from "next/navigation";
import { lucia } from "./auth.config";

export const getActionSession = async () => {
    const demoMode = cookies().get("demo_mode")?.value === "true";
    if (demoMode) {
        return {
            user: {
                id: "demo",
                username: "Demo Nutzer",
                firstname: "Demo",
                lastname: "Nutzer",
                email: "demo@energyleaf.de",
                phone: null,
                address: "Demo Adresse",
                created: new Date().toISOString(),
                isAdmin: false,
                isActive: true,
                appVersion: Versions.transparency as number,
                onboardingCompleted: true,
            },
            session: {
                id: "demo",
                userId: "demo",
                fresh: false,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            },
        };
    }
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
        return {
            user: null,
            session: null,
        };
    }

    try {
        const result = await lucia.validateSession(sessionId);
        try {
            if (result.session?.fresh) {
                const sessionCookie = lucia.createSessionCookie(result.session.id);
                cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
            }
            if (!result.session) {
                const sessionCookie = lucia.createBlankSessionCookie();
                cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
            }
        } catch {
            // ignore
        }
        return result;
    } catch {
        // ignore
    }
    cookies().delete(lucia.sessionCookieName);
    redirect("/");
};
