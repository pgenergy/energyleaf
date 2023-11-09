import { eq } from "drizzle-orm";

import db from "..";
import { device } from "../schema";

export async function getDevicesByUser(userId: number) {
    const query = await db.select().from(device).where(eq(device.userId, userId));
    if (query.length === 0) {
        return null;
    }
    return query.map(x => x.name);
}