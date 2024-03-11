import { cache } from "react";

import "server-only";

import { cookies } from "next/headers";
import { getUserDataCookieStore } from "@/lib/demo/demo";

import {
    getUserById as getDbUserById,
    getUserData as getDbUserDataById,
    getUserDataHistory as getDbUserDataHistoryById
} from "@energyleaf/db/query";
import type { UserDataType } from "@energyleaf/db/types";

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
 * Cached query to retrieve user data
 */
export const getUserData = cache(async (id: string) => {
    if (id === "demo") {
        const data = cookies().get("demo_data")?.value;
        if (!data) {
            return getUserDataCookieStore();
        }

        return JSON.parse(data) as UserDataType;
    }
    return getDbUserDataById(id);
});

/**
 * Cached query to retrieve the history of the given user's data
 */
export const getUserDataHistory = cache(async (id: string) => {
    if (id === "demo") {
        const userData = await getUserData(id);
        return userData ? [userData] : [];
    }
    return getDbUserDataHistoryById(Number(id));
});