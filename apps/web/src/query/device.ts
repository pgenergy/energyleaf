import { cache } from "react";
import "server-only";

import { getDevicesByUser as getDbDevicesByUser } from "@energyleaf/db/query";
import { getDevicesCookieStore } from "@/lib/demo/demo";
import { cookies } from "next/headers";

/**
 * Cached query to retrieve the devices per user.
 */
export const getDevicesByUser = cache(async (id: string) => {
    if (id === "-1") {
        return getDevicesCookieStore(cookies());
    }
    return getDbDevicesByUser(Number(id));
});
