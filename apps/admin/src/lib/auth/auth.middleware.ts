import { cookies } from "next/headers";
import "server-only";
import { lucia } from "./auth.config";

export const getMiddlewareSession = async () => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
        return {
            user: null,
            session: null,
        };
    }

    try {
        const result = await lucia.validateSession(sessionId);
        return result;
    } catch {
        // ignore
    }
    return {
        user: null,
        session: null,
    };
};
