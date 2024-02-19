import {and, between, eq, or, sql} from "drizzle-orm";
import {peaks, sensor, sensorData, sensorToken, SensorType, user, userData} from "../schema";
import {nanoid} from "nanoid";
import db from "..";
import {AggregationType} from "../types/types";
import {SensorAlreadyExistsError} from "@energyleaf/lib/src/errors/sensor-errors";

/**
 * Get the energy consumption for a sensor in a given time range
 */
export async function getEnergyForSensorInRange(
    start: Date,
    end: Date,
    sensorId: string,
    aggregation = AggregationType.RAW,
) {
    if (aggregation === AggregationType.RAW) {
        const query = await db
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

        return query.map((row, index) => ({
            ...row,
            id: index,
        }));
    }

    let grouper = sql<string | number>`EXTRACT(hour FROM ${sensorData.timestamp})`;
    // needs to be hacky because we need a fixed date for the grouping
    let timestamp = sql<Date>`CAST(DATE_FORMAT(${sensorData.timestamp}, '2000-01-01 %H:00:00') AS DATETIME)`;
    switch (aggregation) {
        case AggregationType.DAY:
            grouper = sql<string | number>`WEEKDAY(${sensorData.timestamp})`;
            timestamp = sql<Date>`CAST(DATE_FORMAT(${sensorData.timestamp}, '2000-01-%d 00:00:00') AS DATETIME)`;
            break;
        case AggregationType.WEEK:
            grouper = sql<string | number>`EXTRACT(week FROM ${sensorData.timestamp})`;
            timestamp = sql<Date>`CAST(DATE_FORMAT(${sensorData.timestamp}, '%Y-%m-%d 00:00:00') AS DATETIME)`;
            break;
        case AggregationType.MONTH:
            grouper = sql<string | number>`EXTRACT(month FROM ${sensorData.timestamp})`;
            timestamp = sql<Date>`CAST(DATE_FORMAT(${sensorData.timestamp}, '%Y-%m-01 00:00:00') AS DATETIME)`;
            break;
        case AggregationType.YEAR:
            grouper = sql<string | number>`EXTRACT(year FROM ${sensorData.timestamp})`;
            timestamp = sql<Date>`CAST(DATE_FORMAT(${sensorData.timestamp}, '%Y-01-01 00:00:00') AS DATETIME)`;
            break;
    }

    const query = await db
        .select({
            sensorId: sensorData.sensorId,
            value: sql<number>`AVG(${sensorData.value})`,
            timestamp: timestamp,
            grouper: grouper,
        })
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
        .groupBy(grouper, timestamp)
        .orderBy(grouper);

    return query.map((row, index) => ({
        id: index,
        timestamp: row.timestamp as Date | null,
        value: Number(row.value),
        sensorId: row.sensorId as string | null,
    }));
}

/**
 * Get the average energy consumption for a sensor
 */
export async function getAvgEnergyConsumptionForSensor(sensorId: string) {
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
            .innerJoin(userData, eq(userData.id, sensor.userId))
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
export async function getPeaksBySensor(start: Date, end: Date, sensorId: string) {
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
        .where(and(eq(sensor.userId, userId), eq(sensor.sensor_type, SensorType.Electricity)));

    if (query.length === 0) {
        return null;
    }

    return query[0].id;
}

/**
 * Insert sensor data
 */
export async function insertSensorData(data: { sensorId: string; value: number }) {
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
    id: string;
    clientId: string;
    version: number;
    sensor_type: SensorType;
    userId: number | null;
}

export type User = {
    id: number;
    created: Date | null;
    email: string;
    username: string;
    password: string;
    isAdmin: boolean;
    isActive: boolean;
}

export type SensorWithUser = {
    sensor: Sensor;
    user: User | null;
}
export async function getSensorsWithUser(): Promise<SensorWithUser[]> {
    return db.select().from(sensor).leftJoin(user, eq(user.id, sensor.userId));
}

export interface CreateSensorType {
    macAddress: string;
    sensorType: SensorType;
}

export async function createSensor(createSensorType: CreateSensorType) : Promise<void> {
    await db.transaction(async (trx) => {
        const sensorsWithSameMacAddress = await trx.select()
            .from(sensor)
            .where(eq(sensor.clientId, createSensorType.macAddress));
        if (sensorsWithSameMacAddress.length > 0) {
            throw new SensorAlreadyExistsError(createSensorType.macAddress);
        }

        await trx.insert(sensor).values({
            clientId: createSensorType.macAddress,
            sensor_type: createSensorType.sensorType,
            id: nanoid(30),
            version: 1,
            userId: 33,
        });
    });
}

export async function sensorExists(macAddress: string): Promise<boolean> {
    // const query = await db.select().from(sensor).where(eq(sensor.macAddress, macAddress));
    // return query.length > 0;
    return false;
}

export async function resetSensorKey(sensorId: number, sensorKey: string) {
    // await db.transaction(async (trx) => {
    //     const sensors = await trx.select().from(sensor).where(eq(sensor.id, sensorId));
    //     if (sensors.length === 0) {
    //         throw new Error("Sensor not found");
    //     }
    //
    //     await trx.update(sensor).set({
    //         key: sensorKey,
    //         user_id: null
    //     }).where(eq(sensor.id, sensorId));
    // })
}

export async function deleteSensor(sensorId: string) {
    await db.transaction(async (trx) => {
        const sensors = await trx.select().from(sensor).where(eq(sensor.id, sensorId));
        if (sensors.length === 0) {
            throw new Error("Sensor not found");
        }

        await trx.delete(sensor).where(eq(sensor.id, sensorId));
    })
}

/**
 * Create sensor token
 */
export async function createSensorToken(clientId: string) {
    const code = nanoid(30);
    try {
        await db.transaction(async (trx) => {
            const sensorData = await trx.select().from(sensor).where(eq(sensor.clientId, clientId));

            if (sensorData.length === 0) {
                trx.rollback();
                throw new Error("sensor/not-found");
            }

            await trx.insert(sensorToken).values({
                code: code,
                sensorId: sensorData[0].id,
            });
        });

        return code;
    } catch (err) {
        throw err;
    }
}

/**
 * Get the sensor id from a sensor token
 * This also validates the token and deletes it if it is older than 1 hour
 */
export async function getSensorIdFromSensorToken(code: string) {
    return db.transaction(async (trx) => {
        const tokenData = await trx.select().from(sensorToken).where(eq(sensorToken.code, code));

        if (tokenData.length === 0) {
            throw new Error("token/not-found");
        }

        const token = tokenData[0];
        const tokenDate = token.timestamp;

        if (!tokenDate) {
            trx.rollback();
            throw new Error("token/invalid");
        }

        // check if token is older than 1 hour
        const now = new Date();
        if (now.getTime() - tokenDate.getTime() > 3600000) {
            trx.delete(sensorToken).where(eq(sensorToken.code, code));
            throw new Error("token/expired");
        }

        const sensorData = await trx.select().from(sensor).where(eq(sensor.id, token.sensorId));
        if (sensorData.length === 0) {
            trx.rollback();
            throw new Error("sensor/not-found");
        }

        return sensorData[0].id;
    });
}

/**
 * Get the average energy consumption per device
 */
export async function getAverageConsumptionPerDevice() {
    const result = await db
        .select({
            deviceId: peaks.deviceId,
            averageConsumption: sql<number>`AVG(${sensorData.value})`,
        })
        .from(peaks)
        .innerJoin(
            sensorData,
            sql`${peaks.sensorId} = ${sensorData.sensorId} AND ${peaks.timestamp} = ${sensorData.timestamp}`,
        )
        .groupBy(peaks.deviceId)
        .execute();

    return result;
}