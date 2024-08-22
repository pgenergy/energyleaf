import { AggregationType, UserHasSensorOfSameType } from "@energyleaf/lib";
import { SensorAlreadyExistsError } from "@energyleaf/lib/errors/sensor";
import { and, between, desc, eq, getTableColumns, gt, gte, isNotNull, lt, lte, ne, or, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import db from "../";
import { sensor, sensorData, sensorHistory, sensorToken, user, userData } from "../schema";
import {
    type SensorDataSelectType,
    type SensorInsertType,
    type SensorSelectTypeWithUser,
    SensorType,
} from "../types/types";

export async function insertRawEnergyValues(
    data: {
        id: string;
        value: number;
        timestamp: Date;
        sensorId: string;
    }[],
) {
    await db.insert(sensorData).values(data);
}

export async function getAllSensors(active?: boolean) {
    if (active) {
        return db.select().from(sensor).where(isNotNull(sensor.userId));
    }

    return db.select().from(sensor);
}

export async function getRawEnergyForSensorInRange(
    start: Date,
    end: Date,
    sensorId: string,
): Promise<SensorDataSelectType[]> {
    const { value, valueOut, ...rest } = getTableColumns(sensorData);
    return (
        await db
            .select({
                ...rest,
                value: sql<number>`COALESCE(${sensorData.value} - LAG(${sensorData.value}, 1) OVER (PARTITION BY ${sensorData.sensorId} ORDER BY ${sensorData.timestamp}), 0)`
                    .mapWith({
                        mapFromDriverValue: (value: unknown) => {
                            return Number(value);
                        },
                    })
                    .as("value"),
                valueOut:
                    sql<number>`COALESCE(${sensorData.valueOut} - LAG(${sensorData.valueOut}, 1) OVER (PARTITION BY ${sensorData.sensorId} ORDER BY ${sensorData.timestamp}), 0)`
                        .mapWith({
                            mapFromDriverValue: (value: unknown) => {
                                return Number(value);
                            },
                        })
                        .as("value_out"),
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
            .orderBy(sensorData.timestamp)
    ).slice(1);
}

/**
 * Helper function to split the data into groups and aggregate the values
 */
async function aggregatedValues(
    start: Date,
    end: Date,
    sensorId: string,
    groupValue: string,
    type: "sum" | "average" = "average",
) {
    const sum = type === "sum";
    const subQuery = db
        .select({
            sensorId: sensorData.sensorId,
            value: sql<number>`COALESCE(${sensorData.value} - LAG(${sensorData.value}, 1) OVER (PARTITION BY ${sensorData.sensorId} ORDER BY ${sensorData.timestamp}), 0)`.as(
                "sub_value",
            ),
            consumption: sensorData.consumption,
            valueOut:
                sql<number>`COALESCE(${sensorData.valueOut} - LAG(${sensorData.valueOut}, 1) OVER (PARTITION BY ${sensorData.sensorId} ORDER BY ${sensorData.timestamp}), 0)`.as(
                    "sub_value_out",
                ),
            inserted: sensorData.inserted,
            valueCurrent: sql<number | null>`${sensorData.valueCurrent}`.as("sub_value_current"),
            timestamp: sql`${sensorData.timestamp}`
                .mapWith({
                    mapFromDriverValue: (value: unknown) => {
                        return new Date(`${value}+0000`);
                    },
                })
                .as("sub_timestamp"),
            rowNumber: sql`ROW_NUMBER() OVER (PARTITION BY ${sensorData.sensorId} ORDER BY ${sensorData.timestamp})`
                .mapWith({
                    mapFromDriverValue: (value: unknown) => {
                        return Number(value);
                    },
                })
                .as("rn"),
        })
        .from(sensorData)
        .where(and(eq(sensorData.sensorId, sensorId), between(sensorData.timestamp, start, end)))
        .orderBy(sensorData.timestamp)
        .as("subQuery");

    const convertTimeSql = sql`CONVERT_TZ(${subQuery.timestamp}, 'UTC', 'Europe/Berlin')`;
    let grouperSql = sql``;
    if (groupValue === "WEEKDAY") {
        grouperSql = sql<string>`WEEKDAY(${convertTimeSql})`;
    } else if (groupValue === "WEEK") {
        grouperSql = sql<string>`CEIL((DAY(${convertTimeSql}) + WEEKDAY(DATE_SUB(${convertTimeSql}, INTERVAL DAY(${convertTimeSql}) - 1 DAY))) / 7)`;
    } else {
        grouperSql = sql<string>`DATE_FORMAT(${convertTimeSql}, ${groupValue})`;
    }

    return db
        .select({
            sensorId: subQuery.sensorId,
            value: sum ? sql<number>`SUM(${subQuery.value})` : sql<number>`AVG(${subQuery.value})`,
            consumption: sum ? sql<number>`SUM(${subQuery.consumption})` : sql<number>`AVG(${subQuery.consumption})`,
            valueOut: sum ? sql<number>`SUM(${subQuery.valueOut})` : sql<number>`AVG(${subQuery.valueOut})`,
            inserted: sum ? sql<number>`SUM(${subQuery.inserted})` : sql<number>`AVG(${subQuery.inserted})`,
            valueCurrent: sql<number | null>`AVG(${subQuery.valueCurrent})`,
            timestamp: sql`MIN(${subQuery.timestamp})`.mapWith({
                mapFromDriverValue: (value: unknown) => {
                    return new Date(`${value}+0000`);
                },
            }),
            grouper: grouperSql,
        })
        .from(subQuery)
        .where(and(eq(subQuery.sensorId, sensorId), between(subQuery.timestamp, start, end), gt(subQuery.rowNumber, 1)))
        .groupBy(grouperSql)
        .orderBy(grouperSql);
}

/**
 * Get the aggregation based on hour 0 - 24
 */
export async function getHourEnergyForSensorInRange(
    start: Date,
    end: Date,
    sensorId: string,
    type: "sum" | "average" = "average",
): Promise<SensorDataSelectType[]> {
    const query = await aggregatedValues(start, end, sensorId, "%H", type);
    return query.map((row, index) => ({
        ...row,
        id: index.toString(),
        value: Number(row.value),
        valueOut: Number(row.valueOut),
        valueCurrent: Number(row.valueCurrent),
        timestamp: row.timestamp,
    }));
}

/**
 * Get the aggregation based on day weekday 0 - 7
 */
export async function getWeekDayEnergyForSensorInRange(
    start: Date,
    end: Date,
    sensorId: string,
    type: "sum" | "average" = "average",
): Promise<SensorDataSelectType[]> {
    const query = await aggregatedValues(start, end, sensorId, "WEEKDAY", type);
    return query.map((row, index) => ({
        ...row,
        id: index.toString(),
        value: Number(row.value),
        valueOut: Number(row.valueOut),
        valueCurrent: Number(row.valueCurrent),
        timestamp: row.timestamp,
    }));
}

/**
 * Get the aggregation based on day in month 0 - 31
 */
export async function getDayEnergyForSensorInRange(
    start: Date,
    end: Date,
    sensorId: string,
    type: "sum" | "average" = "average",
): Promise<SensorDataSelectType[]> {
    const query = await aggregatedValues(start, end, sensorId, "%d", type);
    return query.map((row, index) => ({
        ...row,
        id: index.toString(),
        value: Number(row.value),
        valueOut: Number(row.valueOut),
        valueCurrent: Number(row.valueCurrent),
        timestamp: row.timestamp,
    }));
}

/**
 * Get the aggregation based on week per month 0 - 4
 */
export async function getWeekEnergyForSensorInRange(
    start: Date,
    end: Date,
    sensorId: string,
    type: "sum" | "average" = "average",
): Promise<SensorDataSelectType[]> {
    const query = await aggregatedValues(start, end, sensorId, "WEEK", type);
    return query.map((row, index) => ({
        ...row,
        id: index.toString(),
        value: Number(row.value),
        valueOut: Number(row.valueOut),
        valueCurrent: Number(row.valueCurrent),
        timestamp: row.timestamp,
    }));
}

/**
 * Get the aggregation based on week per month 0 - 52
 */
export async function getCalendarWeekEnergyForSensorInRange(
    start: Date,
    end: Date,
    sensorId: string,
    type: "sum" | "average" = "average",
): Promise<SensorDataSelectType[]> {
    const query = await aggregatedValues(start, end, sensorId, "%X-W%V", type);
    return query.map((row, index) => ({
        ...row,
        id: index.toString(),
        value: Number(row.value),
        valueOut: Number(row.valueOut),
        valueCurrent: Number(row.valueCurrent),
        timestamp: row.timestamp,
    }));
}

export async function getMonthEnergyForSensorInRange(
    start: Date,
    end: Date,
    sensorId: string,
    type: "sum" | "average" = "average",
): Promise<SensorDataSelectType[]> {
    const query = await aggregatedValues(start, end, sensorId, "%M", type);
    return query.map((row, index) => ({
        ...row,
        id: index.toString(),
        value: Number(row.value),
        valueOut: Number(row.valueOut),
        valueCurrent: Number(row.valueCurrent),
        timestamp: row.timestamp,
    }));
}

/**
 * Get the aggregation based on year
 */
export async function getYearEnergyForSensorInRange(
    start: Date,
    end: Date,
    sensorId: string,
    type: "sum" | "average" = "average",
): Promise<SensorDataSelectType[]> {
    const query = await aggregatedValues(start, end, sensorId, "%Y", type);
    return query.map((row, index) => ({
        ...row,
        id: index.toString(),
        value: Number(row.value),
        valueOut: Number(row.valueOut),
        valueCurrent: Number(row.valueCurrent),
        timestamp: row.timestamp,
    }));
}

/**
 * Base function to get the energy data for a sensor in a given range with a given aggregation
 */
export async function getEnergyForSensorInRange(
    start: Date,
    end: Date,
    sensorId: string,
    aggregation = AggregationType.RAW,
    type: "sum" | "average" = "average",
): Promise<SensorDataSelectType[]> {
    switch (aggregation) {
        case AggregationType.RAW:
            return getRawEnergyForSensorInRange(start, end, sensorId);
        case AggregationType.HOUR:
            return getHourEnergyForSensorInRange(start, end, sensorId, type);
        case AggregationType.WEEKDAY:
            return getWeekDayEnergyForSensorInRange(start, end, sensorId, type);
        case AggregationType.DAY:
            return getDayEnergyForSensorInRange(start, end, sensorId, type);
        case AggregationType.WEEK:
            return getWeekEnergyForSensorInRange(start, end, sensorId, type);
        case AggregationType.CALENDAR_WEEK:
            return getCalendarWeekEnergyForSensorInRange(start, end, sensorId, type);
        case AggregationType.MONTH:
            return getMonthEnergyForSensorInRange(start, end, sensorId, type);
        case AggregationType.YEAR:
            return getYearEnergyForSensorInRange(start, end, sensorId, type);
        default:
            throw new Error(`Unsupported aggregation type: ${aggregation}`);
    }
}

export async function getEnergyLastEntry(sensorId: string) {
    const query = await db
        .select({
            value: sensorData.value,
            valueOut: sensorData.valueOut,
            valueCurrent: sensorData.valueCurrent,
            timestamp: sensorData.timestamp,
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
                .where(
                    and(
                        eq(sensorData.sensorId, sensorId),
                        gte(sensorData.timestamp, start),
                        lte(sensorData.timestamp, end),
                    ),
                )
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
            value: sensorData.value,
            timestamp: sensorData.timestamp,
        })
        .from(sensorData)
        .where(eq(sensorData.sensorId, sensorId))
        .orderBy(sensorData.timestamp);

    if (query.length === 0) {
        return null;
    }

    let previousValue = query[0].value;
    const differences = query.map((entry, index) => {
        if (index === 0) {
            return 0;
        }

        const difference = Number(entry.value) - Number(previousValue);
        previousValue = entry.value;
        return difference;
    });

    const sumOfDifferences = differences.reduce((acc, diff) => acc + diff, 0);
    const averageDifference = sumOfDifferences / (differences.length - 1);

    return averageDifference;
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

        const sensorQuery = await trx
            .select({
                sensorId: sensorData.sensorId,
                value: sensorData.value,
                timestamp: sensorData.timestamp,
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
            .orderBy(sensorData.sensorId, sensorData.timestamp);

        if (sensorQuery.length === 0) {
            return null;
        }

        const sensorDifferences: Record<string, number[]> = {};

        sensorQuery.forEach((entry, _) => {
            if (!sensorDifferences[entry.sensorId]) {
                sensorDifferences[entry.sensorId] = [];
            }

            const sensorDataList = sensorDifferences[entry.sensorId];
            if (sensorDataList.length === 0) {
                sensorDataList.push(0);
            } else {
                const previousValue = sensorDataList[sensorDataList.length - 1];
                const difference = Number(entry.value) - previousValue;
                sensorDataList.push(difference);
            }
        });

        const differences = Object.values(sensorDifferences).flat();
        const sumOfDifferences = differences.reduce((acc, diff) => acc + diff, 0);
        const sensorCount = Object.keys(sensorDifferences).length;

        if (sensorCount === 0) {
            return null;
        }

        const averageDifference = sumOfDifferences / sensorCount;

        return {
            avg: averageDifference,
            count: sensorCount,
        };
    });

    return query;
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

interface SensorDataInput {
    sensorId: string;
    value: number;
    valueOut?: number;
    valueCurrent?: number;
    sum: boolean;
    timestamp: Date;
}

/**
 * Insert sensor data
 */
export async function insertSensorData(data: SensorDataInput) {
    await db.transaction(async (trx) => {
        const dbSensors = await trx.select().from(sensor).where(eq(sensor.id, data.sensorId));

        if (dbSensors.length === 0) {
            throw new Error("Sensor not found");
        }
        const dbSensor = dbSensors[0];

        const lastEntries = await trx
            .select()
            .from(sensorData)
            .where(and(eq(sensorData.sensorId, dbSensor.id), lt(sensorData.timestamp, data.timestamp)))
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
                consumption: 0,
                valueOut: data.valueOut,
                inserted: 0,
                valueCurrent: data.valueCurrent,
                timestamp: data.timestamp,
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
        const timeDiff = (new Date().getTime() - lastEntry.timestamp.getTime()) / 1000 / 60;
        if (newValue - lastEntry.value > timeDiff * 0.4) {
            throw new Error("value/too-high");
        }

        // filter out false readings from the sensor for value current
        let valueCurrent = data.valueCurrent;
        if (valueCurrent && (valueCurrent > 40000 || valueCurrent < -20000)) {
            if (lastEntry.valueCurrent) {
                valueCurrent = lastEntry.valueCurrent;
            } else {
                valueCurrent = 0;
            }
        }

        // filter out false readings from the sensor for value out
        // we have a toleranz of 2 kwh per minute which is more than enough
        // to filter false readings but also let values pass from high power solar panels
        let valueOut = data.valueOut;
        if (
            valueOut &&
            lastEntry.valueOut &&
            (valueOut < lastEntry.valueOut || valueOut - lastEntry.valueOut > timeDiff * 2)
        ) {
            valueOut = lastEntry.valueOut;
        }

        const consumption = newValue - lastEntry.value;
        const inserted = valueOut && lastEntry.valueOut ? valueOut - lastEntry.valueOut : null;


        await trx.insert(sensorData).values({
            sensorId: dbSensor.id,
            value: newValue,
            consumption,
            valueOut,
            inserted,
            valueCurrent,
            timestamp: data.timestamp,
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
        consumption: 0,
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
        const now = new Date();
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
