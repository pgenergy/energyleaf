import { and, between, eq, or, sql } from "drizzle-orm";

import db from "..";
import { peaks, sensorData, userData, sensor } from "../schema";
import { AggregationType } from "../types/types";

/**
 * Get the energy consumption for a sensor in a given time range
 */
export async function getEnergyForSensorInRange(start: Date, end: Date, sensorId: string, aggregation = AggregationType.RAW) {
    if (aggregation === AggregationType.RAW) {
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

    let grouper = sql<string | number>`EXTRACT(hour FROM ${sensorData.timestamp})`;
    switch (aggregation) {
        case AggregationType.DAY:
            grouper = sql<string | number>`EXTRACT(day FROM ${sensorData.timestamp})`;
            break;
        case AggregationType.WEEK:
            grouper = sql<string | number>`EXTRACT(week FROM ${sensorData.timestamp})`;
            break;
        case AggregationType.MONTH:
            grouper = sql<string | number>`EXTRACT(month FROM ${sensorData.timestamp})`;
            break;
        case AggregationType.YEAR:
            grouper = sql<string | number>`EXTRACT(year FROM ${sensorData.timestamp})`;
            break;
    }

    return db
        .select({
            id: sensorData.id,
            sensorId: sensorData.sensorId,
            value: sql<number>`AVG(${sensorData.value})`,
            timestamp: sensorData.timestamp,
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
        .groupBy(grouper, sensorData.sensorId)
        .orderBy(grouper);
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
export async function addOrUpdatePeak(sensorId: string, timestamp: Date, deviceId: number) {
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

/**
 * Get the sensorId for a user where sensor_type is 'electricity'
 */
export async function getElectricitySensorIdForUser(userId: number) {
    const query = await db
        .select()
        .from(sensor)
        .where(and(eq(sensor.user_id, userId), eq(sensor.sensor_type, "electricity")));

    if (query.length === 0) {
        return null;
    }

    const sensorId = query[0].id;

    return sensorId;
}
