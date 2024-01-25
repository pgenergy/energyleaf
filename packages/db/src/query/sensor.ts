import {and, between, eq, or, sql} from "drizzle-orm";

import db from "..";
import {peaks, sensor, sensorData, SensorType, user, userData} from "../schema";
import {SensorAlreadyExistsError} from "@energyleaf/lib/src/errors/sensor-errors";

/**
 * Get the energy consumption for a sensor in a given time range
 */
export async function getEnergyForSensorInRange(start: Date, end: Date, sensorId: number) {
    return db
        .select()
        .from(sensorData)
        .where(
            and(
                eq(sensorData.sensorId, sensorId),
                or(
                    between(sensorData.timestamp, start, end),
                    eq(sensorData.timestamp, start),
                    eq(sensorData.timestamp, end),
                ),
            ),
        )
        .orderBy(sensorData.timestamp);
}

/**
 * Get the average energy consumption for a sensor
 */
export async function getAvgEnergyConsumptionForSensor(sensorId: number) {
    const query = await db
        .select({
            sensorId: sensorData.sensorId,
            avg: sql<string>`AVG(${sensorData.value})`,
        })
        .from(sensorData)
        .where(eq(sensorData.sensorId, sensorId));

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
                count: sql<string>`COUNT(DISTINCT ${sensor.id})`,
            })
            .from(sensorData)
            .innerJoin(sensor, eq(sensor.id, sensorData.sensorId))
            .innerJoin(userData, eq(userData.id, sensor.user_id))
            .where(
                and(
                    eq(userData.livingSpace, user.livingSpace),
                    eq(userData.household, user.household),
                    eq(userData.property, user.property),
                ),
            )
            .groupBy(userData.livingSpace, userData.household, userData.property);

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
export async function addOrUpdatePeak(sensorId: number, timestamp: Date, deviceId: number) {
    return db.transaction(async (trx) => {
        const data = await trx
            .select()
            .from(peaks)
            .where(and(eq(peaks.sensorId, sensorId), eq(peaks.timestamp, timestamp)));

        if (data.length === 0) {
            return trx.insert(peaks).values({
                sensorId,
                deviceId,
                timestamp,
            });
        }

        return trx
            .update(peaks)
            .set({
                deviceId,
            })
            .where(and(eq(peaks.sensorId, sensorId), eq(peaks.timestamp, timestamp)));
    });
}

/**
 *  gets all peaks for a given device
 */
export async function getPeaksBySensor(start: Date, end: Date, sensorId: number) {
    return db
        .select()
        .from(peaks)
        .leftJoin(sensorData, and(eq(peaks.sensorId, sensorData.sensorId), eq(peaks.timestamp, sensorData.timestamp)))
        .where(and(eq(sensorData.sensorId, sensorId), sensorDataTimeFilter(start, end)));
}

function sensorDataTimeFilter(start: Date, end: Date) {
    return or(
        between(sensorData.timestamp, start, end),
        eq(sensorData.timestamp, start),
        eq(sensorData.timestamp, end),
    );
}

/**
 * Get the sensorId for a user where sensor_type is 'electricity'
 */
export async function getElectricitySensorIdForUser(userId: number) {
    const query = await db
        .select()
        .from(sensor)
        .where(and(eq(sensor.user_id, userId), eq(sensor.sensor_type, SensorType.Electricity)));

    if (query.length === 0) {
        return null;
    }

    const sensorId = query[0].id;

    return sensorId;
}

/**
 * Insert sensor data
 */
export async function insertSensorData(data: { sensorId: number; value: number }) {
    try {
        await db.transaction(async (trx) => {
            const userData = await trx.select().from(sensor).where(eq(sensor.id, data.sensorId));

            if (userData.length === 0) {
                trx.rollback();
                throw new Error("Sensor not found");
            }

            await trx.insert(sensorData).values({
                sensorId: userData[0].id,
                value: data.value,
                timestamp: sql<Date>`NOW()`,
            });
        });
    } catch (err) {
        throw err;
    }
}

export type Sensor = {
    id: number;
    key: string | null;
    macAddress: string;
    sensor_type: SensorType;
    user_id: number | null;
}

export type User = {
    id: number;
    created: Date | null;
    email: string;
    username: string;
    password: string;
    isAdmin: boolean;
}

export type SensorWithUser = {
    sensor: Sensor;
    user: User | null;
}
export async function getSensorsWithUser(): Promise<SensorWithUser[]> {
    return db.select().from(sensor).leftJoin(user, eq(user.id, sensor.user_id));
}

export interface CreateSensorType {
    key: string;
    macAddress: string;
    sensorType: SensorType;
}

export async function createSensor(createSensorType: CreateSensorType) : Promise<void> {
    await db.transaction(async (trx) => {
        const sensorsWithSameMacAddress = await trx.select()
            .from(sensor)
            .where(eq(sensor.macAddress, createSensorType.macAddress));
        if (sensorsWithSameMacAddress.length > 0) {
            throw new SensorAlreadyExistsError(createSensorType.macAddress);
        }

        await trx.insert(sensor).values({
            key: createSensorType.key,
            macAddress: createSensorType.macAddress,
            sensor_type: createSensorType.sensorType,
        });
    });
}

export async function sensorExists(macAddress: string): Promise<boolean> {
    const query = await db.select().from(sensor).where(eq(sensor.macAddress, macAddress));
    return query.length > 0;
}