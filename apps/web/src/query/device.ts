import { cache } from "react";

import { getDevicesByUser as getDbDevicesByUser } from "@energyleaf/db/query";
import { SortOrder } from "@energyleaf/db/util";

/**
 * Cached query to retrieve the devices per user.
 */
export const getDevicesByUser = cache(async (id: string, sortOrder: SortOrder) => {
    return getDbDevicesByUser(Number(id), sortOrder);
});