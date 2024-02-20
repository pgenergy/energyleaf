import { cache } from "react";

import {
    getUserById as getDbUserById,
    getUserData as getDbUserDataById,
    getUsersWitDueReport as getDbUsersWitDueReport
} from "@energyleaf/db/query";

/**
 * Cached query to retrive user data
 */
export const getUserById = cache(async (id: string) => {
    return getDbUserById(Number(id));
});

/**
 * Cached query to retrive user data
 */
export const getUserData = cache(async (id: string) => {
    return getDbUserDataById(Number(id));
});

/**
 * Get users with due report to create and send reports
 */
export const getUsersWitDueReport = cache(async () => {
    return getDbUsersWitDueReport();
});