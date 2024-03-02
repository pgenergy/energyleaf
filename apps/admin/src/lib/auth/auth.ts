import { cache } from "react";
import { cookies } from "next/headers";
import { env } from "@/env.mjs";
import type { Session, User } from "lucia";
import { Lucia } from "lucia";

import { adapter } from "@energyleaf/db/adapter";

import "server-only";

export const getSession = cache(async (): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
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
});

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        name: "auth_session",
        expires: false,
        attributes: {
            domain: `.${env.VERCEL_URL || env.NEXTAUTH_URL || "localhost"}`,
            sameSite: "lax",
            secure: env.VERCEL_ENV === "production" || env.VERCEL_ENV === "preview",
        },
    },
    getUserAttributes: (attributes) => {
        return {
            id: attributes.id,
            name: attributes.name,
            email: attributes.email,
            created: attributes.created,
            isAdmin: attributes.isAdmin,
            isActive: attributes.isActive,
        };
    },
});
