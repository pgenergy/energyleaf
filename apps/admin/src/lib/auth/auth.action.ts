import { cookies } from "next/headers";

import "server-only";

import { lucia } from "./auth.config";

export const getActionSession = async () => {
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

export const checkIfAdmin = async () => {
    const { user, session } = await getActionSession();
    if (!session) {
        throw new Error("Not logged in");
    }
    if (!user.isAdmin) {
        throw new Error("Not an admin");
    }
};
