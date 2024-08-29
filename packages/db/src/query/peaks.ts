import { db as pgDb } from "@energyleaf/postgres";
import { deviceToPeakTable } from "@energyleaf/postgres/schema/device";
import { sensorDataSequenceTable, sensorSequenceMarkingLogTable } from "@energyleaf/postgres/schema/sensor";
import { and, asc, between, desc, eq, lte, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import db, { type DB } from "..";
import { device, deviceToPeak, sensorDataSequence, sensorSequenceMarkingLog } from "../schema";
import type { SensorDataSelectType, SensorDataSequenceType } from "../types/types";
import { getRawEnergyForSensorInRange } from "./sensor";

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
            const isStart = i === 0 || entry.timestamp.getTime() - values[0].timestamp.getTime() < 2 * 60 * 1000;
            let sequenceEnd = i + 1;

            while (sequenceEnd < values.length && values[sequenceEnd].value > threshold) {
                sequenceEnd++;
            }

            const sequenceLength = sequenceEnd - i;

            // only mark as peak if longer then 2min and not marked as anomaly yet
            if (sequenceLength > 8) {
                const avgPeakPower = calculateAveragePower(values.slice(i, sequenceEnd));

                // if sequences are only 2min apart, mark as one sequence, because could be of device variance
                // and only mark a new peak if at least 5min apart from previous
                if (
                    sequences.length > 0 &&
                    entry.timestamp.getTime() - sequences[sequences.length - 1].end.getTime() < 2 * 60 * 1000 &&
                    Math.min(sequences[sequences.length - 1].averagePowerIncludingBaseLoad, avgPeakPower) /
                        Math.max(sequences[sequences.length - 1].averagePowerIncludingBaseLoad, avgPeakPower) >
                        0.8
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
    timePeriod?: { start: Date; end: Date } | undefined;
    type: "peak" | "anomaly";
}

export interface FindAndMarkPeaksResult {
    start: Date;
    end: Date;
    resultCount: number;
}

export async function findAndMark(props: FindAndMarkPeaksProps, threshold = 5): Promise<FindAndMarkPeaksResult> {
    const { sensorId, timePeriod, type } = props;

    return await db.transaction(async (trx) => {
        const { start, end } = timePeriod || (await getSequenceMarkingPeriod(sensorId, type, trx));

        let resultCount = 0;
        try {
            resultCount = await findAndMarkInPeriod(sensorId, start, end, type, threshold, trx);
            await updateLastMarkingTime(sensorId, type, end, trx);
        } catch (err) {
            resultCount = resultCount > 0 ? resultCount : 0;
        }

        return {
            start,
            end,
            resultCount,
        };
    });
}

async function findAndMarkInPeriod(
    sensorId: string,
    start: Date,
    end: Date,
    type: "peak" | "anomaly",
    threshold: number,
    trx: DB,
) {
    // we shift the start 12 hours back, so we have a bigger sample for the threshold
    const sequenceStart = new Date(start);
    sequenceStart.setHours(sequenceStart.getHours() - 24, 0, 0, 0);

    const calcData = await getRawEnergyForSensorInRange(sequenceStart, end, sensorId);

    // make sure we have at least 12 hours of reference data
    if (calcData.length < 2880) {
        return 0;
    }

    // check if all values are integers if so we know that the sensor has no pin
    if (calcData.every((d) => Number.isInteger(d.value))) {
        return 0;
    }

    const energyData = calcData.filter((d) => {
        return d.timestamp.getTime() >= start.getTime();
    });

    const sequencesInConsideredPeriod = findPeaks(calcData, energyData, threshold);

    const sequencesBeforeConsideredPeriod = await trx
        .select()
        .from(sensorDataSequence)
        .where(and(eq(sensorDataSequence.sensorId, sensorId), between(sensorDataSequence.start, sequenceStart, end)));

    const peaksInDay = sequencesInConsideredPeriod
        .map((d) => ({ start: d.start, end: d.end }))
        .concat(sequencesBeforeConsideredPeriod);
    const calcDataWithoutPeaks = calcData.filter(
        (d) => !peaksInDay.some((peak) => d.timestamp >= peak.start && d.timestamp <= peak.end),
    );

    const baseLoad = calculateAveragePower(calcDataWithoutPeaks);
    let peaks: (SensorDataSequenceType & { isAtStart: boolean })[] = sequencesInConsideredPeriod
        .map((d) => ({
            ...d,
            id: nanoid(30),
            averagePeakPower: d.averagePowerIncludingBaseLoad - baseLoad,
            type,
            sensorId,
        }))
        .filter((d) => d.averagePeakPower > 0);

    if (type === "anomaly") {
        // if it is anomaly make sure there at least 30min apart from previous ones to avoid double marking
        const lastAnomaly = sequencesBeforeConsideredPeriod.find((d) => d.type === "anomaly");
        if (lastAnomaly) {
            peaks = peaks.filter((d) => d.start.getTime() - lastAnomaly.end.getTime() > 30 * 60 * 1000);
        }
    }
    if (peaks.length !== 0) {
        await saveSequences(peaks, sensorId, type, start, trx);
    }

    // if there is an anomaly in the last 24 hours return nothing to avoid sending another mail
    if (type === "anomaly") {
        if (sequencesInConsideredPeriod.length !== 0) {
            if (sequencesBeforeConsideredPeriod.some((d) => d.type === "anomaly")) {
                return 0;
            }
        }
    }

    return peaks.length;
}

async function getSequenceMarkingPeriod(sensorId: string, type: "peak" | "anomaly", db: DB) {
    const end = new Date();

    const lastMarking = await getTimeOfLastMarking(sensorId, type, db);
    if (lastMarking) {
        const start = new Date(lastMarking);
        start.setMilliseconds(start.getMilliseconds() + 1); // Add one milliseconds so that the periods don't overlap
        return { start: start <= end ? start : end, end };
    }

    const start = new Date(end);
    start.setHours(end.getHours(), 0, 0, 0);
    return { start, end };
}

async function getTimeOfLastMarking(sensorId: string, type: "peak" | "anomaly", db: DB) {
    const markingLog = await db
        .select()
        .from(sensorSequenceMarkingLog)
        .where(and(eq(sensorSequenceMarkingLog.sensorId, sensorId), eq(sensorSequenceMarkingLog.sequenceType, type)));
    if (markingLog.length > 0) {
        return markingLog[0].lastMarked;
    }

    const lastSequence = await db
        .select()
        .from(sensorDataSequence)
        .where(and(eq(sensorDataSequence.sensorId, sensorId), eq(sensorDataSequence.type, type)))
        .orderBy(desc(sensorDataSequence.end))
        .limit(1);
    if (lastSequence.length > 0) {
        return lastSequence[0].end;
    }

    return null;
}

async function updateLastMarkingTime(sensorId: string, type: "peak" | "anomaly", date: Date, trx: DB) {
    const existing = await trx
        .select()
        .from(sensorSequenceMarkingLog)
        .where(and(eq(sensorSequenceMarkingLog.sensorId, sensorId), eq(sensorSequenceMarkingLog.sequenceType, type)));
    if (existing.length === 0) {
        await trx.insert(sensorSequenceMarkingLog).values({ sensorId, sequenceType: type, lastMarked: date });
        return pgDb.insert(sensorSequenceMarkingLogTable).values({ sensorId, sequenceType: type, lastMarked: date });
    }

    await trx
        .update(sensorSequenceMarkingLog)
        .set({ lastMarked: date })
        .where(and(eq(sensorSequenceMarkingLog.sensorId, sensorId), eq(sensorSequenceMarkingLog.sequenceType, type)));
    return pgDb
        .update(sensorSequenceMarkingLogTable)
        .set({ lastMarked: date })
        .where(
            and(
                eq(sensorSequenceMarkingLogTable.sensorId, sensorId),
                eq(sensorSequenceMarkingLogTable.sequenceType, type),
            ),
        );
}

async function saveSequences(
    peaks: (SensorDataSequenceType & { isAtStart: boolean })[],
    sensorId: string,
    type: "peak" | "anomaly",
    start: Date,
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

        if (
            lastSequenceOfSensor &&
            peaks[0].start.getTime() - lastSequenceOfSensor.end.getTime() < 2 * 60 * 1000 &&
            Math.min(lastSequenceOfSensor.averagePeakPower, peaks[0].averagePeakPower) /
                Math.max(lastSequenceOfSensor.averagePeakPower, peaks[0].averagePeakPower) >
                0.8
        ) {
            await trx
                .update(sensorDataSequence)
                .set({ end: peaks[0].end })
                .where(eq(sensorDataSequence.id, lastSequenceOfSensor.id));
            try {
                await pgDb
                    .update(sensorDataSequenceTable)
                    .set({ end: peaks[0].end })
                    .where(eq(sensorDataSequenceTable.id, lastSequenceOfSensor.id));
            } catch (err) {}
            peaks.shift();
        }
    }

    if (peaks.length > 0) {
        await trx.insert(sensorDataSequence).values(peaks);
        await pgDb.insert(sensorDataSequenceTable).values(peaks);
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

            await pgDb.insert(deviceToPeakTable).values({
                deviceId,
                sensorDataSequenceId,
            });
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
