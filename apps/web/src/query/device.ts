import { getDevicesByUser as getDbDevicesByUser } from "@energyleaf/db/query";
import { cache } from "react";
import "server-only";

/**
 * Cached query to retrieve the devices per user.
 */
export const getDevicesByUser = cache(async (id: string) => {
    return getDbDevicesByUser(id);
});
