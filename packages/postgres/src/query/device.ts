import { type SQLWrapper, and, eq, inArray, sql } from "drizzle-orm";
import { type MathNumericType, type Matrix, all, create } from "mathjs";
import { type DB, db } from "../";
import { deviceHistoryTable, deviceSuggestionsPeakTable, deviceTable, deviceToPeakTable } from "../schema/device";
import { sensorDataSequenceTable } from "../schema/sensor";
import { userDataTable } from "../schema/user";
import type { DeviceCategory } from "../types/types";

export async function getDevicesByUser(userId: string, search?: string) {
    const conditions: SQLWrapper[] = [eq(deviceTable.userId, userId)];
    if (search) {
        const searchText = `%${search.toLowerCase()}%`;
        conditions.push(sql`lower(${deviceTable.name}) LIKE ${searchText}`);
    }

    return db
        .select()
        .from(deviceTable)
        .where(and(...conditions));
}

export async function getDeviceCategoriesByUser(userId: string, database: DB = db) {
    return (
        await database
            .selectDistinct({ category: deviceTable.category })
            .from(deviceTable)
            .where(eq(deviceTable.userId, userId))
    ).map((x) => x.category as DeviceCategory);
}

export type CreateDeviceType = {
    name: string;
    userId: string;
    category: string;
};

export async function createDevice(data: CreateDeviceType) {
    await createDeviceInternal([data], db);
}

export async function createDevices(devices: CreateDeviceType[]) {
    const newIds = await createDeviceInternal(devices, db);
    return newIds.map((id) => id.id);
}

async function createDeviceInternal(data: CreateDeviceType[], trx: DB) {
    return trx
        .insert(deviceTable)
        .values([...data])
        .returning();
}

export async function updateDevice(id: number, data: Partial<CreateDeviceType>) {
    await db.transaction(async (trx) => {
        const deviceToUpdate = await getDeviceById(trx, id);
        await copyToHistoryTable(trx, deviceToUpdate);
        await trx
            .update(deviceTable)
            .set({
                name: data.name,
                category: data.category,
            })
            .where(eq(deviceTable.id, id));
    });
}

export async function deleteDevice(id: number, userId: string) {
    return db.transaction(async (trx) => {
        const deviceToDelete = await getDeviceById(trx, id);
        if (deviceToDelete.userId !== userId) {
            throw new Error("Device does not belong to user.");
        }

        await copyToHistoryTable(trx, deviceToDelete);
        await trx.delete(deviceTable).where(eq(deviceTable.id, id));
    });
}

export async function updatePowerOfDevices(userId: string) {
    return db.transaction(async (trx) => {
        const devicesWithPeaks = await trx
            .select()
            .from(deviceTable)
            .leftJoin(deviceToPeakTable, eq(deviceToPeakTable.deviceId, deviceTable.id))
            .leftJoin(sensorDataSequenceTable, eq(sensorDataSequenceTable.id, deviceToPeakTable.sensorDataSequenceId))
            .where(eq(deviceTable.userId, userId));

        const devices = Array.from(new Set(devicesWithPeaks.map((device) => device.device.id)));
        const flattenPeak = devicesWithPeaks
            .filter((x) => x.device_to_peak && x.sensor_data_sequence)
            .map((device) => ({
                sequenceId: device.sensor_data_sequence?.id ?? "",
                power: device.sensor_data_sequence?.averagePeakPower ?? 0,
                device: device.device_to_peak?.deviceId ?? 0,
            }));

        const peaks = Object.values(
            flattenPeak.reduce(
                (acc, obj) => {
                    if (!acc[obj.sequenceId]) {
                        acc[obj.sequenceId] = { sequence: obj.sequenceId, devices: [], power: obj.power };
                    }
                    acc[obj.sequenceId].devices.push(obj.device);
                    return acc;
                },
                {} as { [key: string]: { sequence: string; devices: number[]; power: number } },
            ),
        );

        const math = create(all, {});

        // Extract matrices. A is a matrix of 0s and 1s, where each row corresponds to a peak and each column to a device. b is a matrix of power values for each peak.
        const A = math.matrix(
            peaks.map((dp) => {
                const row = devices.map((device) => (dp.devices.includes(device) ? 1 : 0));
                return row;
            }),
        );
        const b = math.matrix(peaks.map((dp) => [dp.power]));

        // Solve the least squares problem: (A^T A) x = A^T b
        const At = math.transpose(A);
        const AtA = math.multiply(At, A);
        const Atb = math.multiply(At, b);
        const solution = math.lusolve(AtA, Atb);

        // Extract the solution values and save them to the database
        const result = solution
            .toArray()
            .map((value, index) => ({ [devices[index]]: (value as MathNumericType[])[0] }));
        for (const deviceId of devices) {
            const powerEstimationRaw = result.find((r) => r[deviceId])?.[deviceId];
            const powerEstimation = powerEstimationRaw ? Number(powerEstimationRaw) : null;
            const correctedPowerEstimation = powerEstimation && powerEstimation >= 0 ? powerEstimation : null; // power needs to be greater than 0.
            await trx.update(deviceTable).set({ power: correctedPowerEstimation }).where(eq(deviceTable.id, deviceId));
        }

        // Calculate R^2
        const residuals = math.subtract(b, math.multiply(A, solution));
        const subtraction = math.subtract(b, math.mean(b)) as Matrix;
        const SST = math.sum(math.map(subtraction, math.square));
        const SSR = math.sum(math.map(residuals, math.square));
        let rSquared: number;
        if (SST === 0) {
            rSquared = SSR === 0 ? 1 : 0;
        } else {
            rSquared = math.subtract(1, math.divide(SSR, SST)) as number;
        }
        await trx
            .update(userDataTable)
            .set({ devicePowerEstimationRSquared: rSquared })
            .where(eq(userDataTable.userId, userId));
    });
}

async function getDeviceById(trx: DB, id: number) {
    const query = await trx.select().from(deviceTable).where(eq(deviceTable.id, id));
    if (query.length === 0) {
        throw new Error("Device not found");
    }

    return query[0];
}

async function copyToHistoryTable(
    trx: DB,
    device: {
        id: number;
        userId: string;
        name: string;
        created: Date | null;
        timestamp: Date;
        category: string;
        power: number | null;
        isPowerEstimated: boolean;
    },
) {
    await trx.insert(deviceHistoryTable).values({
        deviceId: device.id,
        userId: device.userId,
        name: device.name,
        created: device.created,
        timestamp: device.timestamp,
        category: device.category,
        power: device.power,
        isPowerEstimated: device.isPowerEstimated,
    });
}

export async function saveDeviceSuggestionsToPeakDb(sensorDataSequenceId: string, suggestions: DeviceCategory[]) {
    await db
        .insert(deviceSuggestionsPeakTable)
        .values(suggestions.map((category) => ({ sensorDataSequenceId, deviceCategory: category })));
}

export async function getPeaksWithoutDevices(peaks: { id: string }[]) {
    const peakIds = peaks.map((peak) => peak.id);

    const existingAssignments = await db
        .select({ id: deviceToPeakTable.sensorDataSequenceId })
        .from(deviceToPeakTable)
        .where(inArray(deviceToPeakTable.sensorDataSequenceId, peakIds));
    const existingIds = new Set(existingAssignments.map((assign) => assign.id));

    return peaks.filter((peak) => !existingIds.has(peak.id));
}
