import type { SensorInsertType, SensorType } from "../types/types";
import { db, genId } from "..";
import { eq, and, ne } from "drizzle-orm";
import { sensorDataTable, sensorHistoryTable, sensorTable, sensorTokenTable } from "../schema/sensor";
import { SensorAlreadyExistsError, UserHasSensorOfSameType } from "@energyleaf/lib/errors/sensor";

type CreateSensorType = {
    macAddress: string;
    sensorType: SensorType;
    script?: string;
    currentValue?: number;
};

export async function createSensor(createSensorType: CreateSensorType): Promise<void> {
    await db.transaction(async (trx) => {
        const sensorsWithSameMacAddress = await trx
            .select()
            .from(sensorTable)
            .where(eq(sensorTable.clientId, createSensorType.macAddress));
        if (sensorsWithSameMacAddress.length > 0) {
            throw new SensorAlreadyExistsError(createSensorType.macAddress);
        }

        await trx.insert(sensorTable).values({
            clientId: createSensorType.macAddress,
            sensorType: createSensorType.sensorType,
            id: genId(30),
            version: 1,
            script: createSensorType.script,
            needsScript: !!createSensorType.script,
        });
    });
}

export async function updateSensor(sensorId: string, data: Partial<SensorInsertType>) {
    return db.transaction(async (trx) => {
        const sensors = await trx.select().from(sensorTable).where(eq(sensorTable.id, sensorId));
        if (sensors.length === 0) {
            throw new Error("Sensor not found");
        }

        if (data.script) {
            data.needsScript = true;
        }

        await trx
            .update(sensorTable)
            .set({ ...data })
            .where(eq(sensorTable.id, sensorId));
    });
}

export async function sensorExists(macAddress: string): Promise<boolean> {
    const query = await db.select().from(sensorTable).where(eq(sensorTable.clientId, macAddress));
    return query.length > 0;
}

export async function deleteSensor(sensorId: string) {
    await db.transaction(async (trx) => {
        const sensors = await trx.select().from(sensorTable).where(eq(sensorTable.id, sensorId));
        if (sensors.length === 0) {
            throw new Error("Sensor not found");
        }

        await trx.delete(sensorTable).where(eq(sensorTable.id, sensorId));
    });
}

export async function getSensorDataByClientId(clientId: string) {
    const query = await db
        .select({
            id: sensorTable.id,
            script: sensorTable.script,
            needsScript: sensorTable.needsScript,
        })
        .from(sensorTable)
        .where(eq(sensorTable.clientId, clientId))
        .limit(1);

    if (query.length === 0) {
        return null;
    }

    return query[0];
}

export async function assignSensorToUser(clientId: string, userId: string | null) {
    return await db.transaction(async (trx) => {
        const query = await trx.select().from(sensorTable).where(eq(sensorTable.clientId, clientId));
        if (query.length === 0) {
            throw new Error("sensor/not-found");
        }

        if (userId) {
            const sensorType = query[0].sensorType;
            const userSensorOfSameType = await trx
                .select()
                .from(sensorTable)
                .where(
                    and(
                        eq(sensorTable.userId, userId),
                        eq(sensorTable.sensorType, sensorType),
                        ne(sensorTable.clientId, clientId),
                    ),
                );
            if (userSensorOfSameType.length > 0) {
                throw new UserHasSensorOfSameType(userId, sensorType);
            }
        }

        const currentSensor = query[0];
        if (currentSensor.userId) {
            // Safe in history table so that the previous user can still see his data
            const contains = await trx
                .select()
                .from(sensorHistoryTable)
                .where(
                    and(
                        eq(sensorHistoryTable.userId, currentSensor.userId),
                        eq(sensorHistoryTable.clientId, currentSensor.clientId),
                    ),
                );
            if (contains.length === 0) {
                await trx.insert(sensorHistoryTable).values({
                    sensorId: currentSensor.id,
                    userId: currentSensor.userId,
                    sensorType: currentSensor.sensorType,
                    clientId: currentSensor.clientId,
                });
            }
        }

        let newId = genId(30);
        if (userId) {
            // Restore the previous sensor ID of the user
            const historyQuery = await trx
                .select()
                .from(sensorHistoryTable)
                .where(
                    and(eq(sensorHistoryTable.userId, userId), eq(sensorHistoryTable.clientId, currentSensor.clientId)),
                );
            if (historyQuery.length > 0) {
                newId = historyQuery[0].sensorId;
            }
        }

        await trx.update(sensorTable).set({ userId: userId, id: newId }).where(eq(sensorTable.clientId, clientId));

        return newId;
    });
}

export async function resetSensorValues(clientId: string) {
    await db.transaction(async (trx) => {
        const sensors = await trx
            .select({ id: sensorTable.id })
            .from(sensorTable)
            .where(eq(sensorTable.clientId, clientId));
        if (sensors.length === 0) {
            return;
        }

        await trx
            .update(sensorTable)
            .set({ userId: null, needsScript: true, script: null })
            .where(eq(sensorTable.clientId, clientId));
        await trx.delete(sensorTokenTable).where(eq(sensorTokenTable.sensorId, sensors[0].id));
        await trx.delete(sensorDataTable).where(eq(sensorDataTable.sensorId, sensors[0].id));
    });
}

export async function updateNeedsScript(sensorId: string, needsScript: boolean) {
    return db
        .update(sensorTable)
        .set({
            needsScript,
        })
        .where(eq(sensorTable.id, sensorId));
}
