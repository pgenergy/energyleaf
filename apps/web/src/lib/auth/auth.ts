/* eslint-disable @typescript-eslint/unbound-method -- NextAuth bug */
import type { CustomSession } from "@/types/auth";
import * as bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { getUserByMail } from "@energyleaf/db/query";

import { authOptions } from "./auth.config";

export const { auth, signIn, signOut } = NextAuth({
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
                const password = credentials.password as string;
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
});

export const getSession = async () => {
    const session = await auth();

    if (!session) {
        return null;
    }

    return session as CustomSession;
};
