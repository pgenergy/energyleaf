import { cache } from "react";

import { getDevicesByUser as getDbDevicesByUser } from "@energyleaf/db/query";
import type { device } from "@energyleaf/db/schema";
import type { SortOrder } from "@energyleaf/db/util";

/**
 * Cached query to retrieve the devices per user.
 */
export const getDevicesByUser = cache(async (id: string, sortOrder: SortOrder = SortOrder.ASC, orderBy: (x: typeof device) => any = x => x.name) => {
    return getDbDevicesByUser(Number(id), sortOrder, orderBy);
});