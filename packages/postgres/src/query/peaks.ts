import { type SQLWrapper, and, asc, between, desc, eq, lte, or } from "drizzle-orm";
import { type DB, db, genId } from "..";
import { deviceSuggestionsPeakTable, deviceTable, deviceToPeakTable } from "../schema/device";
import { sensorDataSequenceTable, sensorDataTable } from "../schema/sensor";
import type {
    SensorDataSelectType,
    SensorDataSequenceSelectType,
    SensorDataSequenceWithSensorDataSelectType,
} from "../types/types";
import { getRawEnergyForSensorInRange } from "./energy-get";

function calculateMedian(values: SensorDataSelectType[]) {
    const sorted = [...values].sort((a, b) => a.consumption - b.consumption);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
        ? sorted[middle].consumption
        : (sorted[middle - 1].consumption + sorted[middle].consumption) / 2;
}

function calculateMAD(values: SensorDataSelectType[], scale = 1.4826, medValue?: number) {
    let medianValue: number | undefined = medValue;
    if (!medianValue) {
        medianValue = calculateMedian(values);
    }
    const deviations = values.map((value) => ({
        ...value,
        consumption: Math.abs(value.consumption - medianValue),
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
        return acc + (curr.consumption / timeDiffInHours) * 1000; // Add power in Watt
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

        if (entry.consumption > threshold) {
            // check if either directly after start or 5 minutes after
            const isStart = i === 0 || entry.timestamp.getTime() - values[0].timestamp.getTime() < 2 * 60 * 1000;
            let sequenceEnd = i + 1;

            while (sequenceEnd < values.length && values[sequenceEnd].consumption > threshold) {
                sequenceEnd++;
            }

            const sequenceLength = sequenceEnd - i;

            // only mark as peak if longer then 2min and not marked as anomaly yet
            if (sequenceLength > 8) {
                const avgPeakPower = calculateAveragePower(values.slice(i, sequenceEnd));

                // if sequences are only 2min apart, mark as one sequence, because could be of device variance
                // and only mark a new peak if at least 2 min apart from previous
                if (
                    sequences.length > 0 &&
                    entry.timestamp.getTime() - sequences[sequences.length - 1].end.getTime() < 2 * 60 * 1000 &&
                    avgPeakPower > sequences[sequences.length - 1].averagePowerIncludingBaseLoad / 2
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
        consumption: Math.abs(value.consumption - median),
    }));
    return findSequences(processedValues, madValue * threshold);
}

interface FindAndMarkPeaksProps {
    sensorId: string;
    start: Date;
    end: Date;
    type: "peak" | "anomaly";
}

export interface FindAndMarkPeaksResult {
    start: Date;
    end: Date;
    resultCount: number;
}

export async function findAndMark(props: FindAndMarkPeaksProps, threshold = 5): Promise<FindAndMarkPeaksResult> {
    const { sensorId, start, end, type } = props;

    return await db.transaction(async (trx) => {
        let resultCount = 0;
        try {
            resultCount = await findAndMarkInPeriod(sensorId, start, end, type, threshold, trx);
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
    // we shift the start 24 hours back, so we have a bigger sample for the threshold
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
        .from(sensorDataSequenceTable)
        .where(
            and(
                eq(sensorDataSequenceTable.sensorId, sensorId),
                between(sensorDataSequenceTable.start, sequenceStart, end),
            ),
        );

    const peaksInDay = sequencesInConsideredPeriod
        .map((d) => ({ start: d.start, end: d.end }))
        .concat(sequencesBeforeConsideredPeriod);
    const calcDataWithoutPeaks = calcData.filter(
        (d) => !peaksInDay.some((peak) => d.timestamp >= peak.start && d.timestamp <= peak.end),
    );

    const baseLoad = calculateAveragePower(calcDataWithoutPeaks);
    let peaks: (SensorDataSequenceSelectType & { isAtStart: boolean })[] = sequencesInConsideredPeriod
        .map((d) => ({
            ...d,
            id: genId(30),
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

async function saveSequences(
    peaks: (SensorDataSequenceSelectType & { isAtStart: boolean })[],
    sensorId: string,
    type: "peak" | "anomaly",
    start: Date,
    trx: DB,
) {
    const firstSequenceMergeable = peaks[0].isAtStart;
    if (firstSequenceMergeable) {
        const lastSequenceOfSensorQuery = await trx
            .select()
            .from(sensorDataSequenceTable)
            .where(
                and(
                    eq(sensorDataSequenceTable.sensorId, sensorId),
                    lte(sensorDataSequenceTable.end, start),
                    eq(sensorDataSequenceTable.type, type),
                ),
            )
            .orderBy(desc(sensorDataSequenceTable.end))
            .limit(1);
        const lastSequenceOfSensor = lastSequenceOfSensorQuery.length > 0 ? lastSequenceOfSensorQuery[0] : null;

        if (
            lastSequenceOfSensor &&
            peaks[0].start.getTime() - lastSequenceOfSensor.end.getTime() < 2 * 60 * 1000 &&
            peaks[0].averagePeakPower > lastSequenceOfSensor.averagePeakPower / 2
        ) {
            await trx
                .update(sensorDataSequenceTable)
                .set({ end: peaks[0].end })
                .where(eq(sensorDataSequenceTable.id, lastSequenceOfSensor.id));
            peaks.shift();
        }
    }

    if (peaks.length > 0) {
        await trx.insert(sensorDataSequenceTable).values(peaks);
    }
}

/**
 *  adds or updates a peak in the database
 */
export async function updateDevicesForPeak(sensorDataSequenceId: string, deviceIds: number[]) {
    return db.transaction(async (trx) => {
        await trx.delete(deviceToPeakTable).where(eq(deviceToPeakTable.sensorDataSequenceId, sensorDataSequenceId));

        for (const deviceId of deviceIds) {
            await trx.insert(deviceToPeakTable).values({
                deviceId,
                sensorDataSequenceId,
            });
            const newWeeklyUsageEstimation = await calculateAverageWeeklyUsageTimeInHours(deviceId);
            await trx
                .update(deviceTable)
                .set({ weeklyUsageEstimation: newWeeklyUsageEstimation })
                .where(eq(deviceTable.id, deviceId));
        }
    });
}

interface ExtraQuerySequencesBySensorProps {
    start: Date;
    end: Date;
}

export async function getSequencesBySensor(sensorId: string, extra?: ExtraQuerySequencesBySensorProps) {
    const wheres: (SQLWrapper | undefined)[] = [eq(sensorDataSequenceTable.sensorId, sensorId)];
    if (extra) {
        wheres.push(
            or(
                between(sensorDataSequenceTable.start, extra.start, extra.end),
                between(sensorDataSequenceTable.end, extra.start, extra.end),
            ),
        );
    }

    const rawData = await db
        .select()
        .from(sensorDataSequenceTable)
        .innerJoin(
            sensorDataTable,
            between(sensorDataTable.timestamp, sensorDataSequenceTable.start, sensorDataSequenceTable.end),
        )
        .where(and(...wheres))
        .orderBy(asc(sensorDataSequenceTable.start), asc(sensorDataTable.timestamp));

    const groupedDataMap: Map<string, SensorDataSequenceWithSensorDataSelectType> = new Map();

    for (const item of rawData) {
        const { sensor_data_sequence, sensor_data } = item;
        if (groupedDataMap.has(sensor_data_sequence.id)) {
            groupedDataMap.get(sensor_data_sequence.id)?.sensorData.push(sensor_data);
        } else {
            groupedDataMap.set(sensor_data_sequence.id, {
                ...sensor_data_sequence,
                sensorData: [sensor_data],
            });
        }
    }

    return Array.from(groupedDataMap.values());
}

export async function getDevicesByPeak(sensorDataSequenceId: string) {
    return db
        .select({
            id: deviceToPeakTable.deviceId,
            name: deviceTable.name,
            category: deviceTable.category,
        })
        .from(deviceToPeakTable)
        .innerJoin(deviceTable, eq(deviceTable.id, deviceToPeakTable.deviceId))
        .where(eq(deviceToPeakTable.sensorDataSequenceId, sensorDataSequenceId));
}

export async function getDeviceSuggestionsByPeak(sensorDataSequenceId: string) {
    return db
        .select()
        .from(deviceSuggestionsPeakTable)
        .where(eq(deviceSuggestionsPeakTable.sensorDataSequenceId, sensorDataSequenceId));
}

export async function getPeaksByDevice(deviceId: number) {
    return db
        .select({
            id: sensorDataSequenceTable.id,
            start: sensorDataSequenceTable.start,
            end: sensorDataSequenceTable.end,
        })
        .from(deviceToPeakTable)
        .innerJoin(sensorDataSequenceTable, eq(sensorDataSequenceTable.id, deviceToPeakTable.sensorDataSequenceId))
        .where(eq(deviceToPeakTable.deviceId, deviceId))
        .orderBy(asc(sensorDataSequenceTable.start));
}
