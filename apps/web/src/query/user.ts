import { cache } from "react";

import "server-only";

import { cookies } from "next/headers";
import { getUserDataCookieStore } from "@/lib/demo/demo";

import {
    getUserById as getDbUserById,
    getUserData as getDbUserDataById,
    getUserDataHistory as getDbUserDataHistoryById,
} from "@energyleaf/db/query";
import type { UserDataSelectType, UserDataType } from "@energyleaf/db/types";
import { Versions } from "@energyleaf/lib/versioning";

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
        const data = cookies().get("demo_data")?.value;
        if (!data) {
            return getUserDataCookieStore();
        }

        const userData = JSON.parse(data) as UserDataType;
        userData.user_data.timestamp = new Date(userData.user_data.timestamp);
        return userData;
    }
    return getDbUserDataById(id);
});

/**
 * Cached query to retrieve the history of the given user's data
 */
export const getUserDataHistory = cache(async (id: string): Promise<UserDataSelectType[]> => {
    if (id === "demo") {
        const userData = await getUserData(id);
        return userData ? [userData.user_data] : [];
    }
    return await getDbUserDataHistoryById(id);
});
