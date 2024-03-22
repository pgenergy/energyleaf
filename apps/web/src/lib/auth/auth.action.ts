import { cookies } from "next/headers";

import "server-only";

import { lucia } from "./auth.config";

export const getActionSession = async () => {
    const demoMode = cookies().get("demo_mode")?.value === "true";
    if (demoMode) {
        return {
            user: {
                id: "demo",
                username: "Demo Nutzer",
                email: "demo@energyleaf.de",
                created: new Date().toISOString(),
                isAdmin: false,
                isActive: true,
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

    const result = await lucia.validateSession(sessionId);
    try {
        if (result.session && result.session.fresh) {
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
};
