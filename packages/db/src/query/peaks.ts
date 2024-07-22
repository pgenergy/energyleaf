import { and, asc, between, desc, eq, getTableColumns, lte, or, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import db, { type DB } from "..";
import { device, deviceToPeak, sensorData, sensorDataSequence } from "../schema";
import type { SensorDataSelectType, SensorDataSequenceType } from "../types/types";

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

async function calculateAverageWeeklyUsageTimeInHours(deviceId: number) {
    const weeklyGroupedPeaks = await getWeeklyGroupedPeaks(deviceId);
    if (weeklyGroupedPeaks.length === 0) {
        return 0;
    }

    const weeklyGroupedTimeInPeaks = weeklyGroupedPeaks.map((week) => {
        return week.peaks.reduce((acc, peak) => {
            const timeDiffInMinutes = (peak.end.getTime() - peak.start.getTime()) / 1000 / 60 / 60;
            return acc + timeDiffInMinutes;
        }, 0);
    });

    // Extrapolate the estimated usage for the current week
    const lastWeek = weeklyGroupedPeaks[weeklyGroupedPeaks.length - 1];
    const now = new Date();
    const totalHoursInWeek = 7 * 24;
    const hoursPassed = (now.getTime() - lastWeek.weekStart.getTime()) / 1000 / 60 / 60;
    const percentageOfWeekPassed = hoursPassed / totalHoursInWeek;

    weeklyGroupedTimeInPeaks[weeklyGroupedTimeInPeaks.length - 1] =
        weeklyGroupedTimeInPeaks[weeklyGroupedTimeInPeaks.length - 1] / percentageOfWeekPassed;

    return weeklyGroupedTimeInPeaks.reduce((acc, time) => acc + time, 0) / weeklyGroupedPeaks.length;
}

interface Peak {
    id: string;
    start: Date;
    end: Date;
}

interface GroupedPeaks {
    weekStart: Date;
    weekEnd: Date;
    peaks: Peak[];
}

async function getWeeklyGroupedPeaks(deviceId: number) {
    const peaksWithDevice = await getPeaksByDevice(deviceId);
    if (!peaksWithDevice || peaksWithDevice.length === 0) {
        return [];
    }

    const timeOfEarliestPeak = peaksWithDevice[0].start;
    const groupedPeaks: GroupedPeaks[] = [];
    const weekStart = new Date(timeOfEarliestPeak);

    while (weekStart < new Date()) {
        let weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        if (weekEnd > new Date()) {
            weekEnd = new Date();
        }

        const peaksInWeek: Peak[] = peaksWithDevice
            .filter((peak) => peak.start >= weekStart && peak.start < weekEnd)
            .map((peak) => ({
                id: peak.id,
                start: peak.start,
                end: peak.end,
            }));
        groupedPeaks.push({
            weekStart: new Date(weekStart),
            weekEnd,
            peaks: peaksInWeek,
        });
        weekStart.setDate(weekStart.getDate() + 7);
    }
    return groupedPeaks;
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
            // check if either directly after start or 5 minutes after
            const isStart = i === 0 || entry.timestamp.getTime() - values[0].timestamp.getTime() < 5 * 60 * 1000;
            let sequenceEnd = i + 1;

            while (sequenceEnd < values.length && values[sequenceEnd].value > threshold) {
                sequenceEnd++;
            }

            const sequenceLength = sequenceEnd - i;

            // only mark as peak if longer then 2min and not marked as anomaly yet
            if (sequenceLength > 8) {
                const avgPeakPower = calculateAveragePower(values.slice(i, sequenceEnd));

                // if sequences are only 5min apart, mark as one sequence, because could be of device variance
                if (
                    sequences.length > 0 &&
                    sequences[sequences.length - 1].end.getTime() - entry.timestamp.getTime() < 5 * 60 * 1000
                ) {
                    sequences[sequences.length - 1].end = values[sequenceEnd - 1].timestamp;
                } else {
                    sequences.push({
                        start: entry.timestamp,
                        end: values[sequenceEnd - 1].timestamp,
                        isAtStart: isStart,
                        averagePowerIncludingBaseLoad: avgPeakPower,
                    });
                }
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
            const { value, ...rest } = getTableColumns(sensorData);
            const calcData = await db
                .select({
                    ...rest,
                    value: sql<number>`${sensorData.value} - LAG(${sensorData.value}, 1) OVER (PARTITION BY ${sensorData.sensorId} ORDER BY ${sensorData.timestamp})`
                        .mapWith({
                            mapFromDriverValue: (value: string) => {
                                return Number(value);
                            },
                        })
                        .as("value"),
                })
                .from(sensorData)
                .where(and(eq(sensorData.sensorId, sensorId), between(sensorData.timestamp, sequenceStart, end)))
                .orderBy(asc(sensorData.timestamp));

            // make sure we have at least 12 hours of reference data
            if (calcData.length < 2880) {
                return [];
            }

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
                .where(
                    and(
                        eq(sensorDataSequence.sensorId, sensorId),
                        between(sensorDataSequence.start, sequenceStart, end),
                    ),
                );

            const peaksInDay = sequencesInConsideredPeriod
                .map((d) => ({ start: d.start, end: d.end }))
                .concat(sequencesBeforeConsideredPeriod);
            const calcDataWithoutPeaks = calcData.filter(
                (d) => !peaksInDay.some((peak) => d.timestamp >= peak.start && d.timestamp <= peak.end),
            );

            const baseLoad = calculateAveragePower(calcDataWithoutPeaks);
            let peaks: (SensorDataSequenceType & { isAtStart: boolean })[] = sequencesInConsideredPeriod.map((d) => ({
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
                await saveSequences(peaks, props, trx);
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

async function saveSequences(
    peaks: (SensorDataSequenceType & { isAtStart: boolean })[],
    { start, sensorId, type }: FindAndMarkPeaksProps,
    trx: DB,
) {
    const firstSequenceMergeable = peaks[0].isAtStart;
    if (firstSequenceMergeable) {
        const lastSequenceOfSensorQuery = await trx
            .select()
            .from(sensorDataSequence)
            .where(
                and(
                    eq(sensorDataSequence.sensorId, sensorId),
                    lte(sensorDataSequence.end, start),
                    eq(sensorDataSequence.type, type),
                ),
            )
            .orderBy(desc(sensorDataSequence.end))
            .limit(1);
        const lastSequenceOfSensor = lastSequenceOfSensorQuery.length > 0 ? lastSequenceOfSensorQuery[0] : null;

        if (lastSequenceOfSensor && peaks[0].start.getTime() - lastSequenceOfSensor.end.getTime() < 5 * 60 * 1000) {
            await trx
                .update(sensorDataSequence)
                .set({ end: peaks[0].end })
                .where(eq(sensorDataSequence.id, lastSequenceOfSensor.id));
            peaks.shift();
        }
    }

    if (peaks.length > 0) {
        await trx.insert(sensorDataSequence).values(peaks);
    }
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

            const newWeeklyUsageEstimation = await calculateAverageWeeklyUsageTimeInHours(deviceId);
            await trx
                .update(device)
                .set({ weeklyUsageEstimation: newWeeklyUsageEstimation })
                .where(eq(device.id, deviceId));
        }
    });
}

interface ExtraQuerySequencesBySensorProps {
    start: Date;
    end: Date;
}

export async function getSequencesBySensor(sensorId: string, extra?: ExtraQuerySequencesBySensorProps) {
    if (extra) {
        return db
            .select()
            .from(sensorDataSequence)
            .where(
                and(
                    eq(sensorDataSequence.sensorId, sensorId),
                    or(
                        between(sensorDataSequence.start, extra.start, extra.end),
                        between(sensorDataSequence.end, extra.start, extra.end),
                    ),
                ),
            );
    }

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

export async function getPeaksByDevice(deviceId: number) {
    return db
        .select({
            id: sensorDataSequence.id,
            start: sensorDataSequence.start,
            end: sensorDataSequence.end,
        })
        .from(deviceToPeak)
        .innerJoin(sensorDataSequence, eq(sensorDataSequence.id, deviceToPeak.sensorDataSequenceId))
        .where(eq(deviceToPeak.deviceId, deviceId))
        .orderBy(asc(sensorDataSequence.start));
}
