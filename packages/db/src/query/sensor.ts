import { AggregationType, UserHasSensorOfSameType } from "@energyleaf/lib";
import { SensorAlreadyExistsError } from "@energyleaf/lib/errors/sensor";
import { and, between, desc, eq, gt, gte, lt, lte, ne, or, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import db from "../";
import { device, deviceToPeak, sensor, sensorData, sensorHistory, sensorToken, user, userData } from "../schema";
import { type SensorInsertType, type SensorSelectTypeWithUser, SensorType } from "../types/types";

interface EnergyData {
    sensorId: string;
    value: number;
    timestamp: string;
    id: string;
}

export async function getEnergyForSensorInRange(
    start: Date,
    end: Date,
    sensorId: string,
    aggregation = AggregationType.RAW,
): Promise<EnergyData[]> {
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
            id: row.id,
            value: index === 0 ? 0 : Number(row.value) - Number(query[index - 1].value),
            timestamp: (row.timestamp as Date).toISOString(),
        }));
    }

    let dateFormat: string;
    switch (aggregation) {
        case AggregationType.HOUR:
            dateFormat = "%Y-%m-%dT%H:00:00Z";
            break;
        case AggregationType.DAY:
            dateFormat = "%Y-%m-%dT00:00:00Z";
            break;
        case AggregationType.WEEK:
            dateFormat = "%X-W%V";
            break;
        case AggregationType.MONTH:
            dateFormat = "%Y-%m-01T00:00:00Z";
            break;
        case AggregationType.YEAR:
            dateFormat = "%Y-01-01T00:00:00Z";
            break;
        default:
            throw new Error(`Unsupported aggregation type: ${aggregation}`);
    }

    const formattedTimestamp = sql`DATE_FORMAT(${sensorData.timestamp}, ${dateFormat})`;

    const query = await db
        .select({
            sensorId: sensorData.sensorId,
            value: sql`AVG(${sensorData.value})`,
            timestamp: formattedTimestamp,
        })
        .from(sensorData)
        .where(and(eq(sensorData.sensorId, sensorId), between(sensorData.timestamp, start, end)))
        .groupBy(formattedTimestamp)
        .orderBy(formattedTimestamp);

    const results = query.map((row, index) => ({
        ...row,
        id: index.toString(),
        value: index === 0 ? 0 : Number(row.value) - Number(query[index - 1].value),
        timestamp: String(row.timestamp),
    }));

    return results.slice(1) as EnergyData[];
}

export async function getEnergyLastEntry(sensorId: string) {
    const query = await db
        .select({
            value: sensorData.value,
        })
        .from(sensorData)
        .where(eq(sensorData.sensorId, sensorId))
        .orderBy(desc(sensorData.timestamp))
        .limit(1);

    if (query.length === 0) {
        return null;
    }

    return query[0];
}

export async function getEnergySumForSensorInRange(start: Date, end: Date, sensorId: string) {
    return await db.transaction(async (trx) => {
        const latestEntryBeforeStart = await trx
            .select({ value: sensorData.value })
            .from(sensorData)
            .where(and(eq(sensorData.sensorId, sensorId), lt(sensorData.timestamp, start)))
            .orderBy(desc(sensorData.timestamp))
            .limit(1);

        let valueBeforeStart: number;
        if (latestEntryBeforeStart.length > 0) {
            valueBeforeStart = latestEntryBeforeStart[0].value;
        } else {
            const firstSensorEntry = await trx
                .select({ value: sensorData.value })
                .from(sensorData)
                .where(and(eq(sensorData.sensorId, sensorId), gte(sensorData.timestamp, start)))
                .orderBy(sensorData.timestamp)
                .limit(1);
            valueBeforeStart = firstSensorEntry.length > 0 ? firstSensorEntry[0].value : 0;
        }

        const latestEntryBeforeEnd = await trx
            .select({ value: sensorData.value })
            .from(sensorData)
            .where(and(eq(sensorData.sensorId, sensorId), lte(sensorData.timestamp, end)))
            .orderBy(desc(sensorData.timestamp))
            .limit(1);
        const valueBeforeEnd = latestEntryBeforeEnd.length > 0 ? latestEntryBeforeEnd[0].value : 0;

        return valueBeforeEnd - valueBeforeStart;
    });
}

/**
 * Get the average energy utils for a sensor
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
 * get the average energy utils for a user in comparison to other users with similar data
 */
export async function getAvgEnergyConsumptionForUserInComparison(userId: string) {
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
export async function updateDevicesForPeak(sensorDataId: string, deviceIds: number[]) {
    return db.transaction(async (trx) => {
        await trx.delete(deviceToPeak).where(eq(deviceToPeak.sensorDataId, sensorDataId));

        for (const deviceId of deviceIds) {
            await trx.insert(deviceToPeak).values({
                deviceId,
                sensorDataId,
            });
        }
    });
}

export async function getDevicesByPeak(sensorDataId: string) {
    return db
        .select({
            id: deviceToPeak.deviceId,
            name: device.name,
        })
        .from(deviceToPeak)
        .innerJoin(device, eq(device.id, deviceToPeak.deviceId))
        .where(eq(deviceToPeak.sensorDataId, sensorDataId));
}

/**
 * Get the sensorId for a user where sensor_type is 'electricity'
 */
export async function getElectricitySensorIdForUser(userId: string) {
    return await db.transaction(async (trx) => {
        const query = await trx
            .select()
            .from(sensor)
            .where(and(eq(sensor.userId, userId), eq(sensor.sensorType, SensorType.Electricity)));

        if (query.length > 0) {
            return query[0].id;
        }

        // User has no sensor in sensor table? Then check the sensor_history table
        const history = await trx
            .select()
            .from(sensorHistory)
            .where(and(eq(sensorHistory.userId, userId), eq(sensorHistory.sensorType, SensorType.Electricity)));
        if (history.length === 0) {
            return null;
        }

        return history[0].sensorId;
    });
}

/**
 * Insert sensor data
 */
export async function insertSensorData(data: { sensorId: string; value: number; sum: boolean }) {
    await db.transaction(async (trx) => {
        const dbSensors = await trx.select().from(sensor).where(eq(sensor.id, data.sensorId));

        if (dbSensors.length === 0) {
            throw new Error("Sensor not found");
        }
        const dbSensor = dbSensors[0];

        const lastEntries = await trx
            .select()
            .from(sensorData)
            .where(eq(sensorData.sensorId, dbSensor.id))
            .orderBy(desc(sensorData.timestamp))
            .limit(1);

        if (lastEntries.length === 0) {
            const newValue = data.value;
            if (newValue <= 0) {
                return;
            }
            await trx.insert(sensorData).values({
                sensorId: dbSensor.id,
                value: newValue,
                timestamp: sql<Date>`NOW()`,
            });
            return;
        }
        const lastEntry = lastEntries[0];

        const newValue = data.sum ? data.value + lastEntry.value : data.value;
        if (newValue <= 0 || newValue < lastEntry.value) {
            return;
        }

        // in this check we allow 0.4 kwh per minute
        // so for 15 seconds which is currently the sensor rate we allow 0.1 kwh
        // in an hour this would be 24 kwh
        // this is a very high value and should never be reached
        // but is hopefully a good protection against faulty sensors
        const timeDiff = new Date(new Date().toUTCString()).getTime() - lastEntry.timestamp.getTime() / 1000 / 60;
        if (newValue - lastEntry.value > timeDiff * 0.4) {
            throw new Error("value/too-high");
        }

        await trx.insert(sensorData).values({
            sensorId: dbSensor.id,
            value: newValue,
            timestamp: sql<Date>`NOW()`,
        });
    });
}

/**
 * Insert raw sensor value
 */
export async function insertRawSensorValue(sensorId: string, value: number) {
    return db.insert(sensorData).values({
        sensorId: sensorId,
        value: value,
        timestamp: sql<Date>`NOW()`,
    });
}

export async function getSensorsWithUser(): Promise<SensorSelectTypeWithUser[]> {
    return db.select().from(sensor).leftJoin(user, eq(user.id, sensor.userId));
}

export async function getSensorsByUser(userId: string) {
    return db.select().from(sensor).where(eq(sensor.userId, userId));
}

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
            .from(sensor)
            .where(eq(sensor.clientId, createSensorType.macAddress));
        if (sensorsWithSameMacAddress.length > 0) {
            throw new SensorAlreadyExistsError(createSensorType.macAddress);
        }

        await trx.insert(sensor).values({
            clientId: createSensorType.macAddress,
            sensorType: createSensorType.sensorType,
            id: nanoid(30),
            version: 1,
            script: createSensorType.script,
            needsScript: !!createSensorType.script,
        });
    });
}

/**
 * Update the sensor data
 */
export async function updateSensor(sensorId: string, data: Partial<SensorInsertType>) {
    return db.transaction(async (trx) => {
        const sensors = await trx.select().from(sensor).where(eq(sensor.id, sensorId));
        if (sensors.length === 0) {
            throw new Error("Sensor not found");
        }

        if (data.script) {
            data.needsScript = true;
        }

        await trx
            .update(sensor)
            .set({ ...data })
            .where(eq(sensor.id, sensorId));
    });
}

export async function sensorExists(macAddress: string): Promise<boolean> {
    const query = await db.select().from(sensor).where(eq(sensor.clientId, macAddress));
    return query.length > 0;
}

export async function deleteSensor(sensorId: string) {
    await db.transaction(async (trx) => {
        const sensors = await trx.select().from(sensor).where(eq(sensor.id, sensorId));
        if (sensors.length === 0) {
            throw new Error("Sensor not found");
        }

        await trx.delete(sensor).where(eq(sensor.id, sensorId));
    });
}

/**
 * Create sensor token
 */
export async function createSensorToken(clientId: string) {
    const dbReturn = await db.transaction(async (trx) => {
        const sensorData = await trx.select().from(sensor).where(eq(sensor.clientId, clientId));
        if (sensorData.length === 0) {
            return {
                error: "sensor/not-found",
                code: null,
            };
        }

        if (!sensorData[0].userId) {
            return {
                error: "sensor/no-user",
                code: null,
            };
        }

        const tokenData = await trx.select().from(sensorToken).where(eq(sensorToken.sensorId, sensorData[0].id));
        if (tokenData.length > 0) {
            await trx.delete(sensorToken).where(eq(sensorToken.sensorId, sensorData[0].id));
        }

        const code = nanoid(30);
        await trx.insert(sensorToken).values({
            code: code,
            sensorId: sensorData[0].id,
        });

        return {
            error: null,
            code: code,
        };
    });

    const { error, code } = dbReturn;

    if (error) {
        throw new Error(error);
    }

    if (!code) {
        throw new Error("sensor/not-found");
    }

    return code;
}

/**
 * Get the script and needsScript for a sensor
 */
export async function getSensorDataByClientId(clientId: string) {
    const query = await db
        .select({
            id: sensor.id,
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
 * Get the sensor data from a client id
 */
export async function getSensorByClientId(clientId: string) {
    const query = await db.select().from(sensor).where(eq(sensor.clientId, clientId));
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
    const dbReturn = await db.transaction(async (trx) => {
        const tokenData = await trx.select().from(sensorToken).where(eq(sensorToken.code, code));

        if (tokenData.length === 0) {
            return {
                error: "token/not-found",
                sensorId: null,
            };
        }

        const token = tokenData[0];
        const tokenDate = token.timestamp;

        if (!tokenDate) {
            await trx.delete(sensorToken).where(eq(sensorToken.sensorId, token.sensorId));
            return {
                error: "token/invalid",
                sensorId: null,
            };
        }

        // check if token is older than 1 hour
        const now = new Date(new Date().toUTCString());
        if (now.getTime() - tokenDate.getTime() > 3600000) {
            await trx.delete(sensorToken).where(eq(sensorToken.sensorId, token.sensorId));
            return {
                error: "token/invalid",
                sensorId: null,
            };
        }

        const sensorData = await trx.select().from(sensor).where(eq(sensor.id, token.sensorId));
        if (sensorData.length === 0) {
            return {
                error: "sensor/not-found",
                sensorId: null,
            };
        }

        if (!sensorData[0].userId) {
            return {
                error: "sensor/no-user",
                sensorId: null,
            };
        }

        return {
            error: null,
            sensorId: sensorData[0].id,
        };
    });

    const { error, sensorId } = dbReturn;

    if (error) {
        throw new Error(error);
    }

    if (!sensorId) {
        throw new Error("sensor/not-found");
    }

    return sensorId;
}

export async function assignSensorToUser(clientId: string, userId: string | null) {
    return await db.transaction(async (trx) => {
        const query = await trx.select().from(sensor).where(eq(sensor.clientId, clientId));
        if (query.length === 0) {
            throw new Error("sensor/not-found");
        }

        if (userId) {
            const sensorType = query[0].sensorType;
            const userSensorOfSameType = await trx
                .select()
                .from(sensor)
                .where(
                    and(eq(sensor.userId, userId), eq(sensor.sensorType, sensorType), ne(sensor.clientId, clientId)),
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
                .from(sensorHistory)
                .where(
                    and(
                        eq(sensorHistory.userId, currentSensor.userId),
                        eq(sensorHistory.clientId, currentSensor.clientId),
                    ),
                );
            if (contains.length === 0) {
                await trx.insert(sensorHistory).values({
                    sensorId: currentSensor.id,
                    userId: currentSensor.userId,
                    sensorType: currentSensor.sensorType,
                    clientId: currentSensor.clientId,
                });
            }
        }

        let newId = nanoid(30);
        if (userId) {
            // Restore the previous sensor ID of the user
            const historyQuery = await trx
                .select()
                .from(sensorHistory)
                .where(and(eq(sensorHistory.userId, userId), eq(sensorHistory.clientId, currentSensor.clientId)));
            if (historyQuery.length > 0) {
                newId = historyQuery[0].sensorId;
            }
        }

        await trx.update(sensor).set({ userId: userId, id: newId }).where(eq(sensor.clientId, clientId));

        return newId;
    });
}

/**
 * Resets the sensor values including:
 * - removing the current user without assigning sensor history
 * - setting the needsScript to true
 * - removing current script
 * - removing the sensor token
 * - removing the sensor data
 *
 * This is a function only for the admin panel
 */
export async function resetSensorValues(clientId: string) {
    await db.transaction(async (trx) => {
        const sensors = await trx.select({ id: sensor.id }).from(sensor).where(eq(sensor.clientId, clientId));
        if (sensors.length === 0) {
            return;
        }

        await trx
            .update(sensor)
            .set({ userId: null, needsScript: true, script: null })
            .where(eq(sensor.clientId, clientId));
        await trx.delete(sensorToken).where(eq(sensorToken.sensorId, sensors[0].id));
        await trx.delete(sensorData).where(eq(sensorData.sensorId, sensors[0].id));
    });
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

export async function calculateAnomaly(id: string, start: Date, end: Date) {
    return db
        .select({
            avg: sql<number>`AVG(${sensorData.value})`,
            std: sql<number>`STD(${sensorData.value})`,
            sensorId: sensorData.sensorId,
        })
        .from(sensorData)
        .innerJoin(sensor, eq(sensor.id, sensorData.sensorId))
        .groupBy(sensorData.sensorId)
        .having(
            and(
                eq(sensor.userId, id),
                gt(sensorData.timestamp, start),
                lt(sensorData.timestamp, end),
                gt(
                    sql<number>`ABS(AVG(${sensorData.value}) - STD(${sensorData.value}))`,
                    sql<number>`2 * STD(${sensorData.value})`,
                ),
            ),
        );
}
