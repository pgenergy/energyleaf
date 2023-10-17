import { cache } from "react";

import { getUserById as getDbUserById, getUserData as getDbUserDataById } from "@energyleaf/db/query";

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
