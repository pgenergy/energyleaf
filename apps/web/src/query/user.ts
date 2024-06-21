import { getDemoUserData } from "@/lib/demo/demo";
import {
    getMailSettings as getDbMailSettings,
    getUserById as getDbUserById,
    getUserData as getDbUserDataById,
    getUserDataHistory as getDbUserDataHistoryById,
    getUserIdByToken as getDbUserIdByToken,
} from "@energyleaf/db/query";
import type { UserDataSelectType } from "@energyleaf/db/types";
import { Versions } from "@energyleaf/lib/versioning";
import { cache } from "react";
import "server-only";

/**
 * Cached query to retrieve user data
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
            isActive: true,
            appVersion: Versions.transparency,
        };
    }

    return getDbUserById(id);
});

/**
 * Cached query to retrieve user data
 */
export const getUserData = cache(async (id: string) => {
    if (id === "demo") {
        return getDemoUserData().user_data;
    }
    return await getDbUserDataById(id);
});

/**
 * Cached query to retrieve the mail configuration of the given user
 */
export const getUserMailConfig = cache(async (id: string) => {
    if (id === "demo") {
        return getDemoUserData().mail_config;
    }
    return await getDbMailSettings(id);
});

/**
 * Cached query to retrieve the history of the given user's data
 */
export const getUserDataHistory = cache(async (id: string): Promise<UserDataSelectType[]> => {
    if (id === "demo") {
        const userData = await getUserData(id);
        return userData ? [userData] : [];
    }
    return await getDbUserDataHistoryById(id);
});

export const getUserIdByToken = cache(async (token: string) => {
    return await getDbUserIdByToken(token);
});
