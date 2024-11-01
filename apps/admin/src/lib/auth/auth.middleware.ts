import { validateSessionToken } from "@energyleaf/postgres/query/auth";
import { cookies } from "next/headers";
import "server-only";

export const getMiddlewareSession = async () => {
    const token = cookies().get("auth_session")?.value ?? null;
    if (!token) {
        return {
            user: null,
            session: null,
        };
    }

    try {
        const result = await validateSessionToken(token);
        return result;
    } catch {
        // ignore
    }
    return {
        user: null,
        session: null,
    };
};
