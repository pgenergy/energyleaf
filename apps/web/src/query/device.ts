import { cache } from "react";

import "server-only";

import { cookies } from "next/headers";
import { getDevicesCookieStore } from "@/lib/demo/demo";

import { getDevicesByUser as getDbDevicesByUser } from "@energyleaf/db/query";

/**
 * Cached query to retrieve the devices per user.
 */
export const getDevicesByUser = cache(async (id: string) => {
    if (id === "demo") {
        return getDevicesCookieStore(cookies());
    }
    return getDbDevicesByUser(id);
});
