import { ExtractTablesWithRelations, desc, eq } from "drizzle-orm";

import db from "..";
import { device, deviceHistory } from "../schema";
import { SortOrder } from "../util";
import { MySqlTransaction } from "drizzle-orm/mysql-core";
import { PlanetScalePreparedQueryHKT, PlanetscaleQueryResultHKT } from "drizzle-orm/planetscale-serverless";

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
    await db.transaction(async (trx) => {
        const deviceToUpdate = await getDeviceById(trx, id);
        await copyToHistoryTable(trx, deviceToUpdate);
        await trx.update(device).set(data).where(eq(device.id, id));
    });
}

export async function deleteDevice(id: number, userId: number) {
    return db.transaction(async (trx) => {
        const deviceToDelete = await getDeviceById(trx, id);
        if (deviceToDelete.userId !== userId) {
            throw new Error("Device does not belong to user.");
        }

        await copyToHistoryTable(trx, deviceToDelete);
        await trx.delete(device).where(eq(device.id, id));
    });
}

async function getDeviceById(trx: MySqlTransaction<PlanetscaleQueryResultHKT, PlanetScalePreparedQueryHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>, id: number) {
    const query = await trx.select().from(device).where(eq(device.id, id));
    if (query.length === 0) {
        throw new Error("Device not found");
    }

    return query[0];
}

async function copyToHistoryTable(trx: MySqlTransaction<PlanetscaleQueryResultHKT, PlanetScalePreparedQueryHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>, device: { id: number; userId: number; name: string; created: Date | null; timestamp: Date; }) {
    await trx.insert(deviceHistory).values({
        deviceId: device.id,
        userId: device.userId,
        name: device.name,
        created: device.created,
        timestamp: device.timestamp
    });
}