import { env } from "@/env.mjs";
import type { CustomJWT, CustomSession, CustomUser } from "@/types/auth";
import type { NextAuthConfig } from "next-auth";

const publicRoutes = ["/legal"];
const unprotectedRoutes = ["/", "/signup", "/forgot", "/reset"];

export const authOptions: NextAuthConfig = {
    providers: [],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/",
    },
    secret: env.NEXTAUTH_SECRET,
    callbacks: {
        async authorized({ request, auth }) {
            const loggedIn = Boolean(auth?.user);
            const url = request.nextUrl;

            if (unprotectedRoutes.includes(url.pathname) && loggedIn) {
                return Response.redirect(new URL("/dashboard", url));
            }

            if (![...publicRoutes, ...unprotectedRoutes].includes(url.pathname) && !loggedIn) {
                return Promise.resolve(false);
            }

            return Promise.resolve(true);
        },
        async jwt({ token, user }) {
            const passedUser = user as CustomUser | null;
            if (passedUser) {
                token.id = passedUser.id.toString();
                token.name = passedUser.name;
                token.email = passedUser.email;
                token.created = passedUser.created?.toString() ?? null;
                token.admin = passedUser.admin;
            }

            return Promise.resolve(token as CustomJWT satisfies CustomJWT);
        },
        session: async (params) => {
            const { session, token } = params as unknown as { session: CustomSession; token: CustomJWT };
            const customSession: CustomSession = {
                ...session,
                user: {
                    id: token.id,
                    name: token.name,
                    email: token.email,
                    created: token.created,
                    admin: token.admin,
                },
            };

            return Promise.resolve(customSession satisfies CustomSession);
        },
    },
};
