import { eq, ExtractTablesWithRelations } from "drizzle-orm";
import { MySqlTransaction } from "drizzle-orm/mysql-core";
import { PlanetScalePreparedQueryHKT, PlanetscaleQueryResultHKT } from "drizzle-orm/planetscale-serverless";

import db from "..";
import { device, deviceHistory } from "../schema";

export async function getDevicesByUser(
    userId: number,
) {
    const query = db.select().from(device).where(eq(device.userId, userId));

    return await query;
}

export type CreateDeviceType = {
    name: string;
    userId: number;
};

export async function createDevice(data: CreateDeviceType) {
    await db.insert(device).values({
        name: data.name,
        userId: data.userId,
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
    device: { id: number; userId: number; name: string; created: Date | null; timestamp: Date },
) {
    await trx.insert(deviceHistory).values({
        deviceId: device.id,
        userId: device.userId,
        name: device.name,
        created: device.created,
        timestamp: device.timestamp,
    });
}
