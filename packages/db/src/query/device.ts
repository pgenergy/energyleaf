import { desc, eq } from "drizzle-orm";

import db from "..";
import { device } from "../schema";
import { SortOrder } from "../util";

export async function getDevicesByUser(userId: number, sortOrder: SortOrder = SortOrder.ASC, orderBy: (x: typeof device) => any = x => x.name) {
    const query = db.select().from(device).where(eq(device.userId, userId)).where(eq(device.deleted, false));
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

export type CreateDeviceType = {
    name: string;
    userId: number;
}

export async function createDevice(data: CreateDeviceType) {
    return db.transaction(async (trx) => {
        await trx.insert(device).values({
            name: data.name,
            userId: data.userId,
        });
    });
}

export async function updateDevice(id: number, data: Partial<CreateDeviceType>) {
    await db.update(device).set(data).where(eq(device.id, id));
}

export async function deleteDevice(id: number, userId: number) {
    console.log("deleteDevice", id, userId);
    return db.transaction(async (trx) => {
        const query = await trx.select().from(device).where(eq(device.id, id));
        if (query.length === 0) {
            throw new Error("Device not found");
        }

        const deviceToDelete = query[0];
        if (deviceToDelete.userId !== userId) {
            throw new Error("Device does not belong to user.");
        }

        await trx.update(device).set({
            deleted: true,
        }).where(eq(device.id, id));
    });
}