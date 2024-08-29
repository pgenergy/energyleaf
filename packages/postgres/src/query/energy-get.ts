import { AggregationType } from "@energyleaf/lib";
import { and, between, desc, eq, or, sql } from "drizzle-orm";
import { db } from "..";
import {
    sensorDataDayTable,
    sensorDataHourTable,
    sensorDataMonthTable,
    sensorDataTable,
    sensorDataWeekTable,
} from "../schema/sensor";
import type { SensorDataSelectType } from "../types/types";

export async function getRawEnergyForSensorInRange(start: Date, end: Date, sensorId: string) {
    return db
        .select()
        .from(sensorDataTable)
        .where(
            and(
                eq(sensorDataTable.sensorId, sensorId),
                or(
                    between(sensorDataTable.timestamp, start, end),
                    eq(sensorDataTable.timestamp, start),
                    eq(sensorDataTable.timestamp, end),
                ),
            ),
        )
        .orderBy(sensorDataTable.timestamp);
}

export async function getHourEnergyForSensorInRange(
    start: Date,
    end: Date,
    sensorId: string,
    agg: "sum" | "average",
): Promise<SensorDataSelectType[]> {
    const data = await db
        .select({
            sensorId: sensorDataHourTable.sensorId,
            value: sql`MAX(${sensorDataHourTable.maxValue})`.mapWith((value) => Number(value)),
            valueOut: sql`MAX(${sensorDataHourTable.maxValueOut})`.mapWith((value) => Number(value)),
            valueCurrent: sql`AVG(${sensorDataHourTable.maxValueCurrent})`.mapWith((value) => Number(value)),
            consumption:
                agg === "average"
                    ? sql`AVG(${sensorDataHourTable.avgConsumption})`.mapWith((value) => Number(value))
                    : sql`SUM(${sensorDataHourTable.sumConsumption})`.mapWith((value) => Number(value)),
            inserted:
                agg === "average"
                    ? sql`AVG(${sensorDataHourTable.avgInserted})`.mapWith((value) => Number(value))
                    : sql`SUM(${sensorDataHourTable.sumInserted})`.mapWith((value) => Number(value)),
            timestamp: sql`MIN(${sensorDataHourTable.minTimestamp})`.mapWith((value) => new Date(`${value}+0000`)),
            grouper: sql`EXTRACT(HOUR FROM ${sensorDataHourTable.bucket} AT TIME ZONE 'Europe/Berlin')`.as("grouper"),
        })
        .from(sensorDataHourTable)
        .where(and(eq(sensorDataHourTable.sensorId, sensorId), between(sensorDataHourTable.bucket, start, end)))
        .groupBy(sensorDataHourTable.sensorId, sql`grouper`);

    return data.map((row, index) => ({
        ...row,
        id: index.toString(),
    }));
}

export async function getWeekdayEnergyForSensorInRange(
    start: Date,
    end: Date,
    sensorId: string,
    agg: "sum" | "average",
): Promise<SensorDataSelectType[]> {
    const data = await db
        .select({
            sensorId: sensorDataDayTable.sensorId,
            value: sql`MAX(${sensorDataDayTable.maxValue})`.mapWith((value) => Number(value)),
            valueOut: sql`MAX(${sensorDataDayTable.maxValueOut})`.mapWith((value) => Number(value)),
            valueCurrent: sql`AVG(${sensorDataDayTable.maxValueCurrent})`.mapWith((value) => Number(value)),
            consumption:
                agg === "average"
                    ? sql`AVG(${sensorDataDayTable.avgConsumption})`.mapWith((value) => Number(value))
                    : sql`SUM(${sensorDataDayTable.sumConsumption})`.mapWith((value) => Number(value)),
            inserted:
                agg === "average"
                    ? sql`AVG(${sensorDataDayTable.avgInserted})`.mapWith((value) => Number(value))
                    : sql`SUM(${sensorDataDayTable.sumInserted})`.mapWith((value) => Number(value)),
            timestamp: sql`MIN(${sensorDataDayTable.minTimestamp})`.mapWith((value) => new Date(`${value}+0000`)),
            grouper: sql`EXTRACT(DOW FROM ${sensorDataDayTable.bucket} AT TIME ZONE 'Europe/Berlin')`.as("grouper"),
        })
        .from(sensorDataDayTable)
        .where(and(eq(sensorDataDayTable.sensorId, sensorId), between(sensorDataDayTable.bucket, start, end)))
        .groupBy(sensorDataDayTable.sensorId, sql`grouper`);

    return data.map((row, index) => ({
        ...row,
        id: index.toString(),
    }));
}

export async function getDayEnergyForSensorInRange(
    start: Date,
    end: Date,
    sensorId: string,
    agg: "sum" | "average",
): Promise<SensorDataSelectType[]> {
    const data = await db
        .select({
            sensorId: sensorDataDayTable.sensorId,
            value: sql`MAX(${sensorDataDayTable.maxValue})`.mapWith((value) => Number(value)),
            valueOut: sql`MAX(${sensorDataDayTable.maxValueOut})`.mapWith((value) => Number(value)),
            valueCurrent: sql`AVG(${sensorDataDayTable.maxValueCurrent})`.mapWith((value) => Number(value)),
            consumption:
                agg === "average"
                    ? sql`AVG(${sensorDataDayTable.avgConsumption})`.mapWith((value) => Number(value))
                    : sql`SUM(${sensorDataDayTable.sumConsumption})`.mapWith((value) => Number(value)),
            inserted:
                agg === "average"
                    ? sql`AVG(${sensorDataDayTable.avgInserted})`.mapWith((value) => Number(value))
                    : sql`SUM(${sensorDataDayTable.sumInserted})`.mapWith((value) => Number(value)),
            timestamp: sql`MIN(${sensorDataDayTable.minTimestamp})`.mapWith((value) => new Date(`${value}+0000`)),
            grouper: sql`EXTRACT(DAY FROM ${sensorDataDayTable.bucket} AT TIME ZONE 'Europe/Berlin')`.as("grouper"),
        })
        .from(sensorDataDayTable)
        .where(and(eq(sensorDataDayTable.sensorId, sensorId), between(sensorDataDayTable.bucket, start, end)))
        .groupBy(sensorDataDayTable.sensorId, sql`grouper`);

    return data.map((row, index) => ({
        ...row,
        id: index.toString(),
    }));
}

export async function getWeekEnergyForSensorInRange(
    start: Date,
    end: Date,
    sensorId: string,
    agg: "sum" | "average",
): Promise<SensorDataSelectType[]> {
    const data = await db
        .select({
            sensorId: sensorDataWeekTable.sensorId,
            value: sql`MAX(${sensorDataWeekTable.maxValue})`.mapWith((value) => Number(value)),
            valueOut: sql`MAX(${sensorDataWeekTable.maxValueOut})`.mapWith((value) => Number(value)),
            valueCurrent: sql`AVG(${sensorDataWeekTable.maxValueCurrent})`.mapWith((value) => Number(value)),
            consumption:
                agg === "average"
                    ? sql`AVG(${sensorDataWeekTable.avgConsumption})`.mapWith((value) => Number(value))
                    : sql`SUM(${sensorDataWeekTable.sumConsumption})`.mapWith((value) => Number(value)),
            inserted:
                agg === "average"
                    ? sql`AVG(${sensorDataWeekTable.avgInserted})`.mapWith((value) => Number(value))
                    : sql`SUM(${sensorDataWeekTable.sumInserted})`.mapWith((value) => Number(value)),
            timestamp: sql`MIN(${sensorDataWeekTable.minTimestamp})`.mapWith((value) => new Date(`${value}+0000`)),
            grouper: sql`EXTRACT(WEEK FROM ${sensorDataWeekTable.bucket} AT TIME ZONE 'Europe/Berlin')`.as("grouper"),
        })
        .from(sensorDataWeekTable)
        .where(and(eq(sensorDataWeekTable.sensorId, sensorId), between(sensorDataWeekTable.bucket, start, end)))
        .groupBy(sensorDataWeekTable.sensorId, sql`grouper`);

    return data.map((row, index) => ({
        ...row,
        id: index.toString(),
    }));
}

export async function getWeekOfMonthEnergyForSensorInRange(
    start: Date,
    end: Date,
    sensorId: string,
    agg: "sum" | "average",
): Promise<SensorDataSelectType[]> {
    const data = await db
        .select({
            sensorId: sensorDataDayTable.sensorId,
            value: sql`MAX(${sensorDataDayTable.maxValue})`.mapWith((value) => Number(value)),
            valueOut: sql`MAX(${sensorDataDayTable.maxValueOut})`.mapWith((value) => Number(value)),
            valueCurrent: sql`AVG(${sensorDataDayTable.maxValueCurrent})`.mapWith((value) => Number(value)),
            consumption:
                agg === "average"
                    ? sql`AVG(${sensorDataDayTable.avgConsumption})`.mapWith((value) => Number(value))
                    : sql`SUM(${sensorDataDayTable.sumConsumption})`.mapWith((value) => Number(value)),
            inserted:
                agg === "average"
                    ? sql`AVG(${sensorDataDayTable.avgInserted})`.mapWith((value) => Number(value))
                    : sql`SUM(${sensorDataDayTable.sumInserted})`.mapWith((value) => Number(value)),
            timestamp: sql`MIN(${sensorDataDayTable.minTimestamp})`.mapWith((value) => new Date(`${value}+0000`)),
            grouper: sql`
                    CEILING((
                        DATE_PART('day', ${sensorDataWeekTable.bucket} AT TIME ZONE 'Europe/Berlin') -
                        DATE_PART('dow', ${sensorDataWeekTable.bucket} AT TIME ZONE 'Europe/Berlin')
                    ) / 7)`.as("grouper"),
        })
        .from(sensorDataDayTable)
        .where(and(eq(sensorDataDayTable.sensorId, sensorId), between(sensorDataDayTable.bucket, start, end)))
        .groupBy(sensorDataDayTable.sensorId, sql`grouper`);

    return data.map((row, index) => ({
        ...row,
        id: index.toString(),
    }));
}

export async function getMonthEnergyForSensorInRange(
    start: Date,
    end: Date,
    sensorId: string,
    agg: "sum" | "average",
): Promise<SensorDataSelectType[]> {
    const data = await db
        .select({
            sensorId: sensorDataMonthTable.sensorId,
            value: sql`MAX(${sensorDataMonthTable.maxValue})`.mapWith((value) => Number(value)),
            valueOut: sql`MAX(${sensorDataMonthTable.maxValueOut})`.mapWith((value) => Number(value)),
            valueCurrent: sql`AVG(${sensorDataMonthTable.maxValueCurrent})`.mapWith((value) => Number(value)),
            consumption:
                agg === "average"
                    ? sql`AVG(${sensorDataMonthTable.avgConsumption})`.mapWith((value) => Number(value))
                    : sql`SUM(${sensorDataMonthTable.sumConsumption})`.mapWith((value) => Number(value)),
            inserted:
                agg === "average"
                    ? sql`AVG(${sensorDataMonthTable.avgInserted})`.mapWith((value) => Number(value))
                    : sql`SUM(${sensorDataMonthTable.sumInserted})`.mapWith((value) => Number(value)),
            timestamp: sql`MIN(${sensorDataMonthTable.minTimestamp})`.mapWith((value) => new Date(`${value}+0000`)),
            grouper: sql`EXTRACT(MONTH FROM ${sensorDataWeekTable.bucket} AT TIME ZONE 'Europe/Berlin')`.as("grouper"),
        })
        .from(sensorDataMonthTable)
        .where(and(eq(sensorDataMonthTable.sensorId, sensorId), between(sensorDataDayTable.bucket, start, end)))
        .groupBy(sensorDataMonthTable.sensorId, sql`grouper`);

    return data.map((row, index) => ({
        ...row,
        id: index.toString(),
    }));
}

export async function getYearEnergyForSensorInRange(
    start: Date,
    end: Date,
    sensorId: string,
    agg: "sum" | "average",
): Promise<SensorDataSelectType[]> {
    const data = await db
        .select({
            sensorId: sensorDataMonthTable.sensorId,
            value: sql`MAX(${sensorDataMonthTable.maxValue})`.mapWith((value) => Number(value)),
            valueOut: sql`MAX(${sensorDataMonthTable.maxValueOut})`.mapWith((value) => Number(value)),
            valueCurrent: sql`AVG(${sensorDataMonthTable.maxValueCurrent})`.mapWith((value) => Number(value)),
            consumption:
                agg === "average"
                    ? sql`AVG(${sensorDataMonthTable.avgConsumption})`.mapWith((value) => Number(value))
                    : sql`SUM(${sensorDataMonthTable.sumConsumption})`.mapWith((value) => Number(value)),
            inserted:
                agg === "average"
                    ? sql`AVG(${sensorDataMonthTable.avgInserted})`.mapWith((value) => Number(value))
                    : sql`SUM(${sensorDataMonthTable.sumInserted})`.mapWith((value) => Number(value)),
            timestamp: sql`MIN(${sensorDataMonthTable.minTimestamp})`.mapWith((value) => new Date(`${value}+0000`)),
            grouper: sql`EXTRACT(YEAR FROM ${sensorDataWeekTable.bucket} AT TIME ZONE 'Europe/Berlin')`.as("grouper"),
        })
        .from(sensorDataMonthTable)
        .where(and(eq(sensorDataMonthTable.sensorId, sensorId), between(sensorDataDayTable.bucket, start, end)))
        .groupBy(sensorDataMonthTable.sensorId, sql`grouper`);

    return data.map((row, index) => ({
        ...row,
        id: index.toString(),
    }));
}

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
            return getWeekdayEnergyForSensorInRange(start, end, sensorId, type);
        case AggregationType.DAY:
            return getDayEnergyForSensorInRange(start, end, sensorId, type);
        case AggregationType.WEEK:
            return getWeekEnergyForSensorInRange(start, end, sensorId, type);
        case AggregationType.CALENDAR_WEEK:
            return getWeekEnergyForSensorInRange(start, end, sensorId, type);
        case AggregationType.MONTH:
            return getMonthEnergyForSensorInRange(start, end, sensorId, type);
        case AggregationType.YEAR:
            return getYearEnergyForSensorInRange(start, end, sensorId, type);
        default:
            throw new Error(`Unsupported aggregation type: ${aggregation}`);
    }
}

export async function getEnergyLastEntry(sensorId: string): Promise<SensorDataSelectType | null> {
    const query = await db
        .select({
            id: sensorDataTable.id,
            sensorId: sensorDataTable.sensorId,
            value: sensorDataTable.value,
            consumption: sensorDataTable.consumption,
            valueOut: sensorDataTable.valueOut,
            inserted: sensorDataTable.inserted,
            valueCurrent: sensorDataTable.valueCurrent,
            timestamp: sensorDataTable.timestamp,
        })
        .from(sensorDataTable)
        .where(eq(sensorDataTable.sensorId, sensorId))
        .orderBy(desc(sensorDataTable.timestamp))
        .limit(1);

    if (query.length === 0) {
        return null;
    }

    return query[0];
}
