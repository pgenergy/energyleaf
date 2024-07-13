import { AggregationType, UserHasSensorOfSameType } from "@energyleaf/lib";
import { SensorAlreadyExistsError } from "@energyleaf/lib/errors/sensor";
import { and, asc, between, desc, eq, gte, inArray, isNotNull, lt, lte, ne, or, sql } from "drizzle-orm";
import { type MathNumericType, type Matrix, all, create } from "mathjs";
import { nanoid } from "nanoid";
import db from "../";
import {
    device,
    deviceToPeak,
    sensor,
    sensorData,
    sensorDataSequence,
    sensorHistory,
    sensorToken,
    user,
    userData,
} from "../schema";
import {
    type SensorDataSelectType,
    type SensorDataSequenceType,
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

function calculateMedian(values: SensorDataSelectType[]) {
    const sorted = [...values].sort((a, b) => a.value - b.value);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[middle].value : (sorted[middle - 1].value + sorted[middle].value) / 2;
}

function calculateMAD(values: SensorDataSelectType[], scale = 1.4826, medValue?: number) {
    let medianValue: number | undefined = medValue;
    if (!medianValue) {
        medianValue = calculateMedian(values);
    }
    const deviations = values.map((value) => ({
        ...value,
        value: Math.abs(value.value - medianValue),
    }));
    return scale * calculateMedian(deviations);
}

/**
 * Returns average power in Watt.
 */
function calculateAveragePower(sensorData: SensorDataSelectType[]) {
    if (sensorData.length < 2) {
        throw new Error("Cant calculate average power for one or no entry.");
        //Won't happen, because our peaks have a minimum length
    }

    const powerSum = sensorData.reduce((acc, curr, index) => {
        if (index === 0) {
            return acc;
        }

        const timeDiffInHours = (curr.timestamp.getTime() - sensorData[index - 1].timestamp.getTime()) / 1000 / 60 / 60;
        return acc + (curr.value / timeDiffInHours) * 1000; // Add power in Watt
    }, 0);

    return powerSum / sensorData.length;
}

interface Sequence {
    start: Date;
    end: Date;
    isAtStart: boolean;
    averagePowerIncludingBaseLoad: number;
}

function findSequences(values: SensorDataSelectType[], threshold: number) {
    const sequences: Sequence[] = [];
    let i = 0;

    while (i < values.length) {
        const entry = values[i];

        if (entry.value > threshold) {
            const isStart = i === 0;
            let sequenceEnd = i + 1;

            while (sequenceEnd < values.length && values[sequenceEnd].value > threshold) {
                sequenceEnd++;
            }

            const sequenceLength = sequenceEnd - i;

            // only mark as peak if longer then 2min and not marked as anomaly yet
            if (sequenceLength > 5) {
                const avgPeakPower = calculateAveragePower(values.slice(i, sequenceEnd));

                sequences.push({
                    start: entry.timestamp,
                    end: values[sequenceEnd - 1].timestamp,
                    isAtStart: isStart,
                    averagePowerIncludingBaseLoad: avgPeakPower,
                });
            }
            i = sequenceEnd;
        } else {
            i++;
        }
    }

    return sequences;
}

/**
 * Finds peaks in a given set of values
 * for peaks 5 is the default threshold, for anomalies 1000 is a good fit
 */
export function findPeaks(
    thresholdValues: SensorDataSelectType[],
    consideredValues: SensorDataSelectType[],
    threshold = 5,
    medianValue?: number,
) {
    let median: number | undefined = medianValue;
    if (!median) {
        median = calculateMedian(thresholdValues);
    }
    const madValue = calculateMAD(thresholdValues, 1.4826, median);
    const processedValues = consideredValues.map((value) => ({
        ...value,
        value: Math.abs(value.value - median),
    }));
    return findSequences(processedValues, madValue * threshold);
}

interface FindAndMarkPeaksProps {
    sensorId: string;
    start: Date;
    end: Date;
    type: "peak" | "anomaly";
}

export async function findAndMark(props: FindAndMarkPeaksProps, threshold = 5) {
    const { sensorId, start, end, type } = props;

    // we shift the start 12 hours back, so we have a bigger sample for the threshold
    const sequenceStart = new Date(start);
    sequenceStart.setHours(sequenceStart.getHours() - 24, 0, 0, 0);

    try {
        return await db.transaction(async (trx) => {
            const calcDbData = await trx
                .select()
                .from(sensorData)
                .where(and(eq(sensorData.sensorId, sensorId), between(sensorData.timestamp, sequenceStart, end)))
                .orderBy(asc(sensorData.timestamp));

            // make sure we have at least 3 hours of reference data
            if (calcDbData.length === 0 || calcDbData.length < 720) {
                return [];
            }

            const calcData = calcDbData
                .map((d, i) => {
                    return {
                        ...d,
                        value: i === 0 ? 0 : Number(d.value) - Number(calcDbData[i - 1].value),
                    };
                })
                .slice(1);

            // check if all values are integers if so we know that the sensor has no pin
            if (calcData.every((d) => Number.isInteger(d.value))) {
                return [];
            }

            const energyData = calcData.filter((d) => {
                return d.timestamp.getTime() >= start.getTime();
            });

            const sequencesInConsideredPeriod = findPeaks(calcData, energyData, threshold);

            const sequencesBeforeConsideredPeriod = await trx
                .select()
                .from(sensorDataSequence)
                .where(and(eq(sensorDataSequence.sensorId, sensorId), between(sensorDataSequence.start, start, end)));

            const peaksInDay = sequencesInConsideredPeriod
                .map((d) => ({ start: d.start, end: d.end }))
                .concat(sequencesBeforeConsideredPeriod.map((d) => d));
            const calcDataWithoutPeaks = calcData.filter(
                (d) => !peaksInDay.some((peak) => d.timestamp >= peak.start && d.timestamp <= peak.end),
            );
            const baseLoad = calculateAveragePower(calcDataWithoutPeaks);
            let peaks: SensorDataSequenceType[] = sequencesInConsideredPeriod.map((d) => ({
                ...d,
                id: nanoid(30),
                averagePeakPower: d.averagePowerIncludingBaseLoad - baseLoad,
                type,
                sensorId,
            }));

            if (props.type === "anomaly") {
                // if it is anomaly make sure there at least 30min apart from previous ones to avoid double marking
                const lastAnomaly = sequencesBeforeConsideredPeriod.find((d) => d.type === "anomaly");
                if (lastAnomaly) {
                    peaks = peaks.filter((d) => d.start.getTime() - lastAnomaly.end.getTime() > 30 * 60 * 1000);
                }
            }
            if (peaks.length !== 0) {
                // check before value if this peak is part of another peak sequence
                // if so we don't mark it as peak
                if (sequencesInConsideredPeriod[0].isAtStart) {
                    const lastSequenceOfSensorQuery = await trx
                        .select()
                        .from(sensorDataSequence)
                        .where(
                            and(
                                eq(sensorDataSequence.sensorId, sensorId),
                                lt(sensorDataSequence.end, start),
                                eq(sensorDataSequence.type, type),
                            ),
                        )
                        .orderBy(desc(sensorDataSequence.end))
                        .limit(1);
                    const lastSequenceOfSensor =
                        lastSequenceOfSensorQuery.length > 0 ? lastSequenceOfSensorQuery[0] : null;

                    const beforeIndex = calcData.findIndex((d) => d.id === energyData[0].id);
                    const lastEntryBeforeInterval = calcData[beforeIndex - 1];

                    if (
                        lastSequenceOfSensor &&
                        lastSequenceOfSensor.end.getTime() >= lastEntryBeforeInterval.timestamp.getTime()
                    ) {
                        await trx
                            .update(sensorDataSequence)
                            .set({ end: sequencesInConsideredPeriod[0].end })
                            .where(eq(sensorDataSequence.id, lastSequenceOfSensor.id));
                    } else {
                        await trx.insert(sensorDataSequence).values(peaks);
                    }
                } else {
                    await trx.insert(sensorDataSequence).values(peaks);
                }
            }

            // if there is an anomaly in the last 24 hours return nothing to avoid sending another mail
            if (props.type === "anomaly") {
                if (sequencesInConsideredPeriod.length !== 0) {
                    if (sequencesBeforeConsideredPeriod.some((d) => d.type === "anomaly")) {
                        return [];
                    }
                }
            }

            return peaks;
        });
    } catch (err) {
        return [];
    }
}

export async function getEnergyForSensorInRange(
    start: Date,
    end: Date,
    sensorId: string,
    aggregation = AggregationType.RAW,
): Promise<SensorDataSelectType[]> {
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
            valueOut: row.valueOut
                ? index === 0
                    ? 0
                    : Number(row.valueOut) - Number(query[index - 1].valueOut)
                : null,
            valueCurrent: row.valueCurrent,
            timestamp: row.timestamp,
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

    const formattedTimestamp = sql<string>`DATE_FORMAT(${sensorData.timestamp}, ${dateFormat})`;

    const query = await db
        .select({
            sensorId: sensorData.sensorId,
            value: sql<number>`AVG(${sensorData.value})`,
            valueOut: sql<number | null>`AVG(${sensorData.valueOut})`,
            valueCurrent: sql<number | null>`AVG(${sensorData.valueCurrent})`,
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
        valueOut: row.valueOut ? (index === 0 ? 0 : Number(row.valueOut) - Number(query[index - 1].valueOut)) : null,
        valueCurrent: row.valueCurrent,
        timestamp: new Date(row.timestamp),
        isPeak: false,
        isAnomaly: false,
    }));

    return results.slice(1);
}

export async function getEnergyLastEntry(sensorId: string) {
    const query = await db
        .select({
            value: sensorData.value,
            valueOut: sensorData.valueOut,
            valueCurrent: sensorData.valueCurrent,
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
 *  adds or updates a peak in the database
 */
export async function updateDevicesForPeak(sensorDataSequenceId: string, deviceIds: number[]) {
    return db.transaction(async (trx) => {
        await trx.delete(deviceToPeak).where(eq(deviceToPeak.sensorDataSequenceId, sensorDataSequenceId));

        for (const deviceId of deviceIds) {
            await trx.insert(deviceToPeak).values({
                deviceId,
                sensorDataSequenceId,
            });
        }
    });
}

export async function updatePowerOfDevices(userId: string) {
    return db.transaction(async (trx) => {
        const devicesWithPeaks = await trx
            .select()
            .from(device)
            .leftJoin(deviceToPeak, eq(deviceToPeak.deviceId, device.id))
            .leftJoin(sensorDataSequence, eq(sensorDataSequence.id, deviceToPeak.sensorDataSequenceId))
            .where(eq(device.userId, userId));

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

        // Extract matrices
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
            await trx.update(device).set({ powerEstimation: correctedPowerEstimation }).where(eq(device.id, deviceId));
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
        await trx.update(userData).set({ devicePowerEstimationRSquared: rSquared }).where(eq(userData.userId, userId));
    });
}

export async function getSequencesBySensor(sensorId: string) {
    return db.select().from(sensorDataSequence).where(eq(sensorDataSequence.sensorId, sensorId));
}

export async function getDevicesByPeak(sensorDataSequenceId: string) {
    return db
        .select({
            id: deviceToPeak.deviceId,
            name: device.name,
        })
        .from(deviceToPeak)
        .innerJoin(device, eq(device.id, deviceToPeak.deviceId))
        .where(eq(deviceToPeak.sensorDataSequenceId, sensorDataSequenceId));
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
                valueOut: data.valueOut,
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

        await trx.insert(sensorData).values({
            sensorId: dbSensor.id,
            value: newValue,
            valueOut: data.valueOut,
            valueCurrent: data.valueCurrent,
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
