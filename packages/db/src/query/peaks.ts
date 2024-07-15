import { type ExtractTablesWithRelations, and, asc, between, desc, eq, gt, gte, lt, lte, or } from "drizzle-orm";
import type { MySqlTransaction } from "drizzle-orm/mysql-core";
import type { PlanetScalePreparedQueryHKT, PlanetscaleQueryResultHKT } from "drizzle-orm/planetscale-serverless";
import { nanoid } from "nanoid";
import db from "..";
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
                await saveSequences(peaks, props, calcData, energyData, trx);
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
    consideredData: SensorDataSelectType[],
    dayData: SensorDataSelectType[],
    trx: MySqlTransaction<
        PlanetscaleQueryResultHKT,
        PlanetScalePreparedQueryHKT,
        Record<string, never>,
        ExtractTablesWithRelations<Record<string, never>>
    >,
) {
    const firstSequenceMergeable = peaks[0].isAtStart;
    if (firstSequenceMergeable) {
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
        const lastSequenceOfSensor = lastSequenceOfSensorQuery.length > 0 ? lastSequenceOfSensorQuery[0] : null;

        const beforeIndex = consideredData.findIndex((d) => d.id === dayData[0].id);
        const lastEntryBeforeInterval = consideredData[beforeIndex - 1];

        if (lastSequenceOfSensor && lastSequenceOfSensor.end.getTime() >= lastEntryBeforeInterval.timestamp.getTime()) {
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
