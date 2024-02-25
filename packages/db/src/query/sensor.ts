import { and, between, desc, eq, or, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

import db from "../";
import { peaks, sensor, sensorData, sensorToken, userData } from "../schema";
import { AggregationType } from "../types/types";

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

        return query.map((row, index) => {
            if (index === 0) {
                return {
                    ...row,
                    id: index,
                    value: Number(0),
                };
            }

            return {
                ...row,
                id: index,
                value: Number(row.value) - Number(query[index - 1].value),
            };
        });
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
            value: sql<string>`AVG(${sensorData.value})`,
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

    return query.map((row, index) => {
        if (index === 0) {
            return {
                ...row,
                id: index,
                value: Number(0),
            };
        }

        return {
            ...row,
            id: index,
            value: Number(row.value) - Number(query[index - 1].value),
        };
    });
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
export async function insertSensorData(data: { sensorId: string; value: number; sum: boolean }) {
    try {
        await db.transaction(async (trx) => {
            const userData = await trx.select().from(sensor).where(eq(sensor.id, data.sensorId));

            if (userData.length === 0) {
                trx.rollback();
                throw new Error("Sensor not found");
            }

            if (data.sum) {
                const lastEntry = await trx
                    .select()
                    .from(sensorData)
                    .where(eq(sensorData.sensorId, userData[0].id))
                    .orderBy(desc(sensorData.timestamp))
                    .limit(1);

                if (lastEntry.length === 0) {
                    await trx.insert(sensorData).values({
                        sensorId: userData[0].id,
                        value: data.value,
                        timestamp: sql<Date>`NOW()`,
                    });
                    return;
                }

                await trx.insert(sensorData).values({
                    sensorId: userData[0].id,
                    value: data.value + lastEntry[0].value,
                    timestamp: sql<Date>`NOW()`,
                });
            } else {
                await trx.insert(sensorData).values({
                    sensorId: userData[0].id,
                    value: data.value,
                    timestamp: sql<Date>`NOW()`,
                });
            }
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
        .where(and(eq(sensor.userId, userId), eq(sensor.sensor_type, "electricity")));

    if (query.length === 0) {
        return null;
    }

    const sensorId = query[0].id;

    return sensorId;
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
 * Get the script and needsScript for a sensor
 */
export async function getSensorScript(clientId: string) {
    const query = await db
        .select({
            script: sensor.script,
            needsScript: sensor.needsScript,
        })
        .from(sensor)
        .where(eq(sensor.clientId, clientId))
        .limit(1);

    if (query.length === 0) {
        return null;
    }

    return query[0];
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

/**
 * Update the needsScript for a sensor
 */
export async function updateNeedsScript(sensorId: string, needsScript: boolean) {
    return db
        .update(sensor)
        .set({
            needsScript,
        })
        .where(eq(sensor.id, sensorId));
}
