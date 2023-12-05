import { desc, eq } from "drizzle-orm";

import db from "..";
import { device } from "../schema";
import { SortOrder } from "../util";

export async function getDevicesByUser(userId: number, sortOrder: SortOrder = SortOrder.ASC, orderBy: (x: typeof device) => any = x => x.name) {
    const query = db.select().from(device).where(eq(device.userId, userId));
    if (sortOrder === SortOrder.ASC) {
        query.orderBy(orderBy(device));
    }
    else {
        query.orderBy(desc(orderBy(device)));
    }

    const results = await query;
    if (results.length === 0) {
        return null;
    }
    return results;
}