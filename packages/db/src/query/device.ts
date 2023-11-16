import { desc, eq } from "drizzle-orm";

import db from "..";
import { device } from "../schema";
import { SortOrder } from "../util";

export async function getDevicesByUser(userId: number, sortOrder: SortOrder = SortOrder.ASC) {
    const query = db.select().from(device).where(eq(device.userId, userId));
    if (sortOrder === SortOrder.ASC) {
        query.orderBy(device.name);
    }
    else {
        query.orderBy(desc(device.name));
    }

    const results = await query;
    if (results.length === 0) {
        return null;
    }
    return results.map(x => x.name);
}