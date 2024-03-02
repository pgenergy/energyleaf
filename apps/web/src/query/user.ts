import { cache } from "react";

import "server-only";

import { getDemoUserData } from "@/lib/demo/demo";

import { getUserById as getDbUserById, getUserData as getDbUserDataById } from "@energyleaf/db/query";

/**
 * Cached query to retrive user data
 */
export const getUserById = cache(async (id: string) => {
    if (id === "demo") {
        return {
            id: "demo",
            email: "demo@energyleaf.de",
            username: "Demo User",
            password: "demo",
            isAdmin: false,
            created: new Date(),
        };
    }

    return getDbUserById(id);
});

/**
 * Cached query to retrive user data
 */
export const getUserData = cache(async (id: string) => {
    if (id === "demo") {
        return getDemoUserData();
    }
    return getDbUserDataById(id);
});
