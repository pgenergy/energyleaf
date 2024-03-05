import { cache } from "react";

import "server-only";

import { getDemoUserData } from "@/lib/demo/demo";

import {
    getUserById as getDbUserById,
    getUserData as getDbUserDataById,
    getUserDataHistory as getDbUserDataHistoryById
} from "@energyleaf/db/query";

/**
 * Cached query to retrive user data
 */
export const getUserById = cache(async (id: string) => {
    if (id === "-1") {
        return {
            id: -1,
            email: "demo@energyleaf.de",
            username: "Demo User",
            password: "demo",
            isAdmin: false,
            created: new Date(),
        };
    }

    return getDbUserById(Number(id));
});

/**
 * Cached query to retrieve user data
 */
export const getUserData = cache(async (id: string) => {
    if (id === "-1") {
        return getDemoUserData();
    }
    return getDbUserDataById(Number(id));
});

/**
 * Cached query to retrieve the history of the given user's data
 */
export const getUserDataHistory = cache(async (id: string) => {
    if (id === "-1") {
        return [getDemoUserData().user_data];
    }
    return getDbUserDataHistoryById(Number(id));
});