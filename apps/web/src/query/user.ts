import {cache} from "react";

import "server-only";

import {getDemoUserData} from "@/lib/demo/demo";

import {
    getUserById as getDbUserById, getUserData as getDbUserDataById,
    getUsersWitDueReport as getDbUsersWitDueReport
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
 * Cached query to retrive user data
 */
export const getUserData = cache(async (id: string) => {
    if (id === "-1") {
        return getDemoUserData();
    }
    return getDbUserDataById(Number(id));
});

/**
 * Get users with due report to create and send reports
 */
export const getUsersWitDueReport = cache(async () => {
    return getDbUsersWitDueReport();
});