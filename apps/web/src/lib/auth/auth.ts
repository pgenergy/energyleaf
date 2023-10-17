import { redirect } from "next/navigation";
import * as bcrypt from "bcryptjs";
import { getServerSession, type AuthOptions } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import * as CredentialsProvider from "next-auth/providers/credentials";

import { getUserByMail } from "@energyleaf/db/query";

/**
 * Auth options for next-auth
 */
export const authOptions: AuthOptions = {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/",
    },
    providers: [
        CredentialsProvider.default({
            name: "credentials",
            credentials: {
                email: {
                    label: "E-Mail",
                    type: "email",
                    placeholder: "E-Mail",
                },
                password: {
                    label: "Passwort",
                    type: "password",
                    placeholder: "Passwort",
                },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null;
                }
                const { email, password } = credentials;
                const user = await getUserByMail(email);
                if (!user) {
                    return null;
                }

                const match = await bcrypt.compare(password, user.password);
                if (!match) {
                    return null;
                }

                return {
                    id: user.id.toString(),
                    name: user.username,
                    email: user.email,
                    created: user.created?.toString() ?? null,
                    sensorId: user.sensorId,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            const passedUser = user as AdapterUser | undefined;

            if (passedUser) {
                token.id = passedUser.id.toString();
                token.name = passedUser.name;
                token.email = passedUser.email;
                token.created = passedUser.created?.toString() ?? null;
                token.sensorId = passedUser.sensorId;
            }

            return Promise.resolve(token);
        },
        session: async ({ session, token }) => {
            session.user.id = token.id;
            session.user.email = token.email;
            session.user.name = token.name;
            session.user.created = token.created;
            session.user.sensorId = token.sensorId;

            return Promise.resolve(session);
        },
    },
};

/**
 * Get session on the server side
 */
export async function getSessionOnServer() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return null;
    }

    return session;
}

/**
 * Get session on the server and redirect to login if not logged in
 * If unprotected is set to true, logged in users a redirected to the dashboard
 */
export async function getProtectedSession(unprotected = false) {
    const session = await getSessionOnServer();
    if (unprotected && session) {
        return redirect("/dashboard");
    }

    if (!session) {
        return redirect("/");
    }

    return session;
}
