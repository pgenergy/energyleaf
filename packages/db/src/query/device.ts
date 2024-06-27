import { type ExtractTablesWithRelations, eq } from "drizzle-orm";
import type { MySqlTransaction } from "drizzle-orm/mysql-core";
import type { PlanetScalePreparedQueryHKT, PlanetscaleQueryResultHKT } from "drizzle-orm/planetscale-serverless";
import db from "../";
import { device, deviceHistory } from "../schema";

export async function getDevicesByUser(userId: string) {
    const query = db.select().from(device).where(eq(device.userId, userId));

    return await query;
}

export type CreateDeviceType = {
    name: string;
    userId: string;
    category: string;
};

export async function createDevice(data: CreateDeviceType) {
    await db.insert(device).values({
        name: data.name,
        userId: data.userId,
        category: data.category,
    });
}

export async function updateDevice(id: number, data: Partial<CreateDeviceType>) {
    await db.transaction(async (trx) => {
        const deviceToUpdate = await getDeviceById(trx, id);
        await copyToHistoryTable(trx, deviceToUpdate);
        await trx
            .update(device)
            .set({
                name: data.name,
                category: data.category,
            })
            .where(eq(device.id, id));
    });
}

export async function deleteDevice(id: number, userId: string) {
    return db.transaction(async (trx) => {
        const deviceToDelete = await getDeviceById(trx, id);
        if (deviceToDelete.userId !== userId) {
            throw new Error("Device does not belong to user.");
        }

        await copyToHistoryTable(trx, deviceToDelete);
        await trx.delete(device).where(eq(device.id, id));
    });
}

async function getDeviceById(
    trx: MySqlTransaction<
        PlanetscaleQueryResultHKT,
        PlanetScalePreparedQueryHKT,
        Record<string, never>,
        ExtractTablesWithRelations<Record<string, never>>
    >,
    id: number,
) {
    const query = await trx.select().from(device).where(eq(device.id, id));
    if (query.length === 0) {
        throw new Error("Device not found");
    }

    return query[0];
}

async function copyToHistoryTable(
    trx: MySqlTransaction<
        PlanetscaleQueryResultHKT,
        PlanetScalePreparedQueryHKT,
        Record<string, never>,
        ExtractTablesWithRelations<Record<string, never>>
    >,
    device: { id: number; userId: string; name: string; created: Date | null; timestamp: Date },
) {
    await trx.insert(deviceHistory).values({
        deviceId: device.id,
        userId: device.userId,
        name: device.name,
        created: device.created,
        timestamp: device.timestamp,
    });
}
