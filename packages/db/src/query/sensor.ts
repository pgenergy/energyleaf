import { and, between, eq, or, sql } from "drizzle-orm";

import db from "..";
import { peaks, sensor, sensorData, user, userData } from "../schema";

/**
 * Get the energy consumption for a user in a given time range
 */
export async function getEnergyForUserInRange(start: Date, end: Date, userId: number) {
    return db
        .select()
        .from(sensorData)
        .where(and(eq(sensorData.userId, userId), sensorDataTimeFilter(start, end)))
        .orderBy(sensorData.timestamp);
}

/**
 * Get the average energy consumption for a user
 */
export async function getAvgEnergyConsumptionForUser(userId: number) {
    const query = await db
        .select({
            userId: sensorData.userId,
            avg: sql<string>`AVG(${sensorData.value})`,
        })
        .from(sensorData)
        .where(eq(sensorData.userId, userId));

    if (query.length === 0) {
        return null;
    }

    return Number(query[0].avg);
}

/**
 * get the average energy consumption for a user in comparison to other users with similar data
 */
export async function getAvgEnergyConsumptionForUserInComparison(userId: number) {
    const query = await db.transaction(async (trx) => {
        const data = await trx.select().from(userData).where(eq(userData.userId, userId));

        if (data.length === 0) {
            return null;
        }

        const user = data[0];
        if (!user.livingSpace || !user.household || !user.property) {
            return null;
        }

        const avg = await trx
            .select({
                avg: sql<string>`AVG(${sensorData.value})`,
                count: sql<string>`COUNT(${sensorData.value})`,
            })
            .from(sensorData)
            .innerJoin(userData, eq(userData.userId, sensorData.userId))
            .where(
                and(
                    eq(userData.livingSpace, user.livingSpace),
                    eq(userData.household, user.household),
                    eq(userData.property, user.property),
                ),
            );

        if (avg.length === 0) {
            return null;
        }

        return {
            avg: Number(avg[0].avg),
            count: Number(avg[0].count),
        };
    });

    return query;
}

/**
 *  adds or updates a peak in the database
 */
export async function addOrUpdatePeak(sensorDataId: number, deviceId: number) {
    return db.transaction(async (trx) => {
        const data = await trx.select().from(peaks).where(eq(peaks.sensorDataId, sensorDataId));

        if (data.length === 0) {
            return trx.insert(peaks).values({
                sensorDataId,
                deviceId,
            });
        }

        return trx
            .update(peaks)
            .set({
                deviceId,
            })
            .where(eq(peaks.sensorDataId, sensorDataId));
    });
}

/**
 *  gets all peaks for a given device
 */
export async function getPeaksByUser(start: Date, end: Date, userId: number) {
    return db
        .select()
        .from(peaks)
        .innerJoin(sensorData, eq(sensorData.id, peaks.sensorDataId))
        .where(and(eq(sensorData.userId, userId), sensorDataTimeFilter(start, end)));
}

function sensorDataTimeFilter(start: Date, end: Date) {
    return or(
        between(sensorData.timestamp, start, end),
        eq(sensorData.timestamp, start),
        eq(sensorData.timestamp, end),
    );
}
/**
 * Insert sensor data
 */
export async function insertSensorData(data: { id: string; value: number }) {
    try {
        await db.transaction(async (trx) => {
            const userData = await trx.select().from(user).where(eq(user.sensorId, data.id));

            if (userData.length === 0) {
                trx.rollback();
                throw new Error("Sensor not found");
            }

            await trx.insert(sensorData).values({
                userId: userData[0].id,
                value: data.value,
                timestamp: sql<Date>`NOW()`,
            });
        });
    } catch (err) {
        throw err;
    }
}

export type CreateSensorType = {
    key: string;
    macAddress: string;
};

export async function createSensor(createType: CreateSensorType) {
    await db.insert(sensor)
        .values({
            key: createType.key,
            code: "1234567890", // TODO: Can we remove this?,
            macAddress: createType.macAddress
        });
}
