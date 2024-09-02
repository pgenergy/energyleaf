import { env } from "@/env.mjs";
import { adapter } from "@energyleaf/postgres/adapter";
import { Lucia } from "lucia";

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        name: "auth_session",
        expires: false,
        attributes: {
            sameSite: "lax",
            secure: env.VERCEL_ENV === "production" || env.VERCEL_ENV === "preview",
        },
    },
    getUserAttributes: (attributes) => {
        return {
            id: attributes.id,
            username: attributes.username,
            email: attributes.email,
            created: attributes.created,
            isAdmin: attributes.isAdmin,
            isActive: attributes.isActive,
        };
    },
});
