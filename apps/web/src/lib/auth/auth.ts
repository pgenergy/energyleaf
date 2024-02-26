import type { CustomSession } from "@/types/auth";
import * as bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { getUserByMail } from "@energyleaf/db/query";
import { UserNotActiveError } from "@energyleaf/lib";

import { authOptions } from "./auth.config";

export const {
    auth,
    signIn,
    signOut,
    handlers: { GET, POST },
} = NextAuth({
    ...authOptions,
    providers: [
        Credentials({
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
                if (!credentials.email || !credentials.password) {
                    return null;
                }
                const email = credentials.email as string;

                if (email === "demo@energyleaf.de") {
                    return {
                        id: "-1",
                        name: "Demo User",
                        email: "demo@energyleaf.de",
                        created: new Date().toString(),
                        admin: false,
                    };
                }

                const password = credentials.password as string;
                const user = await getUserByMail(email);
                if (!user) {
                    return null;
                }

                if (!user.isActive) {
                    throw new UserNotActiveError();
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
                    admin: user.isAdmin || false,
                };
            },
        }),
    ],
});

export const getSession = async () => {
    const session = await auth();

    if (!session) {
        return null;
    }

    return session as CustomSession;
};
