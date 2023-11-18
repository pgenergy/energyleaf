import type { CustomJWT, CustomSession, CustomUser } from "@/types/auth";
import type { NextAuthConfig } from "next-auth";

const publicRoutes = ["/legal"];
const unprotectedRoutes = ["/", "/signup"];

export const authOptions: NextAuthConfig = {
    providers: [],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/",
    },
    callbacks: {
        async authorized({ request, auth }) {
            const loggedIn = Boolean(auth?.user);
            const url = request.nextUrl;

            const user = auth?.user as CustomUser;

            if (unprotectedRoutes.includes(url.pathname) && loggedIn) {
                return Response.redirect(new URL("/dashboard", url));
            }


            if (![...publicRoutes, ...unprotectedRoutes].includes(url.pathname) && !loggedIn) {
                return false;
            }

            if (!user.admin) {
                return false;
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
                token.sensorId = passedUser.sensorId;
                token.admin = passedUser.admin;
            }

            return Promise.resolve(token as CustomJWT satisfies CustomJWT);
        },
        session: async ({ session, token }) => {
            const customToken = token as CustomJWT;
            const customSession: CustomSession = {
                ...session,
                user: {
                    id: customToken.id,
                    name: customToken.name,
                    email: customToken.email,
                    created: customToken.created,
                    sensorId: customToken.sensorId,
                    admin: customToken.admin,
                },
            };

            return Promise.resolve(customSession satisfies CustomSession);
        },
    },
};
