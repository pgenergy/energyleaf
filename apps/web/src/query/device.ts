import { cache } from "react";

import { getDevicesByUser as getDbDevicesByUser } from "@energyleaf/db/query";
import { SortOrder } from "@energyleaf/db/util";
import { device } from "@energyleaf/db/schema";

/**
 * Cached query to retrieve the devices per user.
 */
export const getDevicesByUser = cache(async (id: string, sortOrder: SortOrder, orderBy: (x: typeof device) => any) => {
    return getDbDevicesByUser(Number(id), sortOrder, orderBy);
});