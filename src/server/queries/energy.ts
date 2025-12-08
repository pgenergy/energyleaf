// import "server-only";
import { and, between, desc, eq, or, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "../db";
import { energyDataTable } from "../db/tables/sensor";

async function getRawEnergyForSensorInRange(start: Date, end: Date, sensorId: string) {
	return db
		.select()
		.from(energyDataTable)
		.where(
			and(
				eq(energyDataTable.sensorId, sensorId),
				or(
					between(energyDataTable.timestamp, start, end),
					eq(energyDataTable.timestamp, start),
					eq(energyDataTable.timestamp, end),
				),
			),
		)
		.orderBy(energyDataTable.timestamp);
}

async function getHourEnergyForSensorInRange(start: Date, end: Date, sensorId: string, agg: "sum" | "average") {
	const data = await db
		.select({
			sensorId: energyDataTable.sensorId,
			value: sql`MAX(${energyDataTable.value})`.mapWith((value) => Number(value)),
			valueOut: sql`MAX(${energyDataTable.valueOut})`.mapWith((value) => Number(value)),
			valueCurrent: sql`AVG(${energyDataTable.valueCurrent})`.mapWith((value) => Number(value)),
			consumption:
				agg === "average"
					? sql`AVG(${energyDataTable.consumption})`.mapWith((value) => Number(value))
					: sql`SUM(${energyDataTable.consumption})`.mapWith((value) => Number(value)),
			inserted:
				agg === "average"
					? sql`AVG(${energyDataTable.inserted})`.mapWith((value) => Number(value))
					: sql`SUM(${energyDataTable.inserted})`.mapWith((value) => Number(value)),
			timestamp: sql`MIN(date_trunc('hour', ${energyDataTable.timestamp}))`.mapWith(
				(value) => new Date(`${value}+0000`),
			),
			grouper: sql`EXTRACT(HOUR FROM date_trunc('hour', ${energyDataTable.timestamp}))`.as("grouper"),
		})
		.from(energyDataTable)
		.where(and(eq(energyDataTable.sensorId, sensorId), between(energyDataTable.timestamp, start, end)))
		.groupBy(energyDataTable.sensorId, sql`grouper`)
		.orderBy(sql`grouper`);

	return data.map((row, index) => ({
		...row,
		id: index.toString(),
	}));
}

async function getWeekdayEnergyForSensorInRange(start: Date, end: Date, sensorId: string, agg: "sum" | "average") {
	const data = await db
		.select({
			sensorId: energyDataTable.sensorId,
			value: sql`MAX(${energyDataTable.value})`.mapWith((value) => Number(value)),
			valueOut: sql`MAX(${energyDataTable.valueOut})`.mapWith((value) => Number(value)),
			valueCurrent: sql`AVG(${energyDataTable.valueCurrent})`.mapWith((value) => Number(value)),
			consumption:
				agg === "average"
					? sql`AVG(${energyDataTable.consumption})`.mapWith((value) => Number(value))
					: sql`SUM(${energyDataTable.consumption})`.mapWith((value) => Number(value)),
			inserted:
				agg === "average"
					? sql`AVG(${energyDataTable.inserted})`.mapWith((value) => Number(value))
					: sql`SUM(${energyDataTable.inserted})`.mapWith((value) => Number(value)),
			timestamp: sql`MIN(date_trunc('day', ${energyDataTable.timestamp}))`.mapWith(
				(value) => new Date(`${value}+0000`),
			),
			grouper: sql`EXTRACT(ISODOW FROM date_trunc('day', ${energyDataTable.timestamp}))`.as("grouper"),
		})
		.from(energyDataTable)
		.where(and(eq(energyDataTable.sensorId, sensorId), between(energyDataTable.timestamp, start, end)))
		.groupBy(energyDataTable.sensorId, sql`grouper`)
		.orderBy(sql`grouper`);

	return data.map((row, index) => ({
		...row,
		id: index.toString(),
	}));
}

async function getDayEnergyForSensorInRange(start: Date, end: Date, sensorId: string, agg: "sum" | "average") {
	const data = await db
		.select({
			sensorId: energyDataTable.sensorId,
			value: sql`MAX(${energyDataTable.value})`.mapWith((value) => Number(value)),
			valueOut: sql`MAX(${energyDataTable.valueOut})`.mapWith((value) => Number(value)),
			valueCurrent: sql`AVG(${energyDataTable.valueCurrent})`.mapWith((value) => Number(value)),
			consumption:
				agg === "average"
					? sql`AVG(${energyDataTable.consumption})`.mapWith((value) => Number(value))
					: sql`SUM(${energyDataTable.consumption})`.mapWith((value) => Number(value)),
			inserted:
				agg === "average"
					? sql`AVG(${energyDataTable.inserted})`.mapWith((value) => Number(value))
					: sql`SUM(${energyDataTable.inserted})`.mapWith((value) => Number(value)),
			timestamp: sql`MIN(date_trunc('day', ${energyDataTable.timestamp}))`.mapWith(
				(value) => new Date(`${value}+0000`),
			),
			grouper: sql`EXTRACT(DAY FROM date_trunc('day', ${energyDataTable.timestamp}))`.as("grouper"),
		})
		.from(energyDataTable)
		.where(and(eq(energyDataTable.sensorId, sensorId), between(energyDataTable.timestamp, start, end)))
		.groupBy(energyDataTable.sensorId, sql`grouper`)
		.orderBy(sql`grouper`);

	return data.map((row, index) => ({
		...row,
		id: index.toString(),
	}));
}

async function getWeekEnergyForSensorInRange(start: Date, end: Date, sensorId: string, agg: "sum" | "average") {
	const data = await db
		.select({
			sensorId: energyDataTable.sensorId,
			value: sql`MAX(${energyDataTable.value})`.mapWith((value) => Number(value)),
			valueOut: sql`MAX(${energyDataTable.valueOut})`.mapWith((value) => Number(value)),
			valueCurrent: sql`AVG(${energyDataTable.valueCurrent})`.mapWith((value) => Number(value)),
			consumption:
				agg === "average"
					? sql`AVG(${energyDataTable.consumption})`.mapWith((value) => Number(value))
					: sql`SUM(${energyDataTable.consumption})`.mapWith((value) => Number(value)),
			inserted:
				agg === "average"
					? sql`AVG(${energyDataTable.inserted})`.mapWith((value) => Number(value))
					: sql`SUM(${energyDataTable.inserted})`.mapWith((value) => Number(value)),
			timestamp: sql`MIN(date_trunc('week', ${energyDataTable.timestamp}))`.mapWith(
				(value) => new Date(`${value}+0000`),
			),
			grouper: sql`EXTRACT(WEEK FROM date_trunc('week', ${energyDataTable.timestamp}))`.as("grouper"),
		})
		.from(energyDataTable)
		.where(and(eq(energyDataTable.sensorId, sensorId), between(energyDataTable.timestamp, start, end)))
		.groupBy(energyDataTable.sensorId, sql`grouper`)
		.orderBy(sql`grouper`);

	return data.map((row, index) => ({
		...row,
		id: index.toString(),
	}));
}

async function getWeekOfMonthEnergyForSensorInRange(start: Date, end: Date, sensorId: string, agg: "sum" | "average") {
	const data = await db
		.select({
			sensorId: energyDataTable.sensorId,
			value: sql`MAX(${energyDataTable.value})`.mapWith((value) => Number(value)),
			valueOut: sql`MAX(${energyDataTable.valueOut})`.mapWith((value) => Number(value)),
			valueCurrent: sql`AVG(${energyDataTable.valueCurrent})`.mapWith((value) => Number(value)),
			consumption:
				agg === "average"
					? sql`AVG(${energyDataTable.consumption})`.mapWith((value) => Number(value))
					: sql`SUM(${energyDataTable.consumption})`.mapWith((value) => Number(value)),
			inserted:
				agg === "average"
					? sql`AVG(${energyDataTable.inserted})`.mapWith((value) => Number(value))
					: sql`SUM(${energyDataTable.inserted})`.mapWith((value) => Number(value)),
			timestamp: sql`MIN(date_trunc('week', ${energyDataTable.timestamp}))`.mapWith(
				(value) => new Date(`${value}+0000`),
			),
			grouper: sql`
                    CEILING((
                        DATE_PART('day', date_trunc('week', ${energyDataTable.timestamp})) -
                        DATE_PART('dow', date_trunc('week', ${energyDataTable.timestamp}))
                    ) / 7)`.as("grouper"),
		})
		.from(energyDataTable)
		.where(and(eq(energyDataTable.sensorId, sensorId), between(energyDataTable.timestamp, start, end)))
		.groupBy(energyDataTable.sensorId, sql`grouper`)
		.orderBy(sql`grouper`);

	return data.map((row, index) => ({
		...row,
		id: index.toString(),
	}));
}

async function getMonthEnergyForSensorInRange(start: Date, end: Date, sensorId: string, agg: "sum" | "average") {
	const data = await db
		.select({
			sensorId: energyDataTable.sensorId,
			value: sql`MAX(${energyDataTable.value})`.mapWith((value) => Number(value)),
			valueOut: sql`MAX(${energyDataTable.valueOut})`.mapWith((value) => Number(value)),
			valueCurrent: sql`AVG(${energyDataTable.valueCurrent})`.mapWith((value) => Number(value)),
			consumption:
				agg === "average"
					? sql`AVG(${energyDataTable.consumption})`.mapWith((value) => Number(value))
					: sql`SUM(${energyDataTable.consumption})`.mapWith((value) => Number(value)),
			inserted:
				agg === "average"
					? sql`AVG(${energyDataTable.inserted})`.mapWith((value) => Number(value))
					: sql`SUM(${energyDataTable.inserted})`.mapWith((value) => Number(value)),
			timestamp: sql`MIN(date_trunc('month', ${energyDataTable.timestamp}))`.mapWith(
				(value) => new Date(`${value}+0000`),
			),
			grouper: sql`EXTRACT(MONTH FROM date_trunc('month', ${energyDataTable.timestamp}))`.as("grouper"),
		})
		.from(energyDataTable)
		.where(and(eq(energyDataTable.sensorId, sensorId), between(energyDataTable.timestamp, start, end)))
		.groupBy(energyDataTable.sensorId, sql`grouper`)
		.orderBy(sql`grouper`);

	return data.map((row, index) => ({
		...row,
		id: index.toString(),
	}));
}

async function getYearEnergyForSensorInRange(start: Date, end: Date, sensorId: string, agg: "sum" | "average") {
	const data = await db
		.select({
			sensorId: energyDataTable.sensorId,
			value: sql`MAX(${energyDataTable.value})`.mapWith((value) => Number(value)),
			valueOut: sql`MAX(${energyDataTable.valueOut})`.mapWith((value) => Number(value)),
			valueCurrent: sql`AVG(${energyDataTable.valueCurrent})`.mapWith((value) => Number(value)),
			consumption:
				agg === "average"
					? sql`AVG(${energyDataTable.consumption})`.mapWith((value) => Number(value))
					: sql`SUM(${energyDataTable.consumption})`.mapWith((value) => Number(value)),
			inserted:
				agg === "average"
					? sql`AVG(${energyDataTable.inserted})`.mapWith((value) => Number(value))
					: sql`SUM(${energyDataTable.inserted})`.mapWith((value) => Number(value)),
			timestamp: sql`MIN(date_trunc('month', ${energyDataTable.timestamp}))`.mapWith(
				(value) => new Date(`${value}+0000`),
			),
			grouper: sql`EXTRACT(YEAR FROM date_trunc('month', ${energyDataTable.timestamp}))`.as("grouper"),
		})
		.from(energyDataTable)
		.where(and(eq(energyDataTable.sensorId, sensorId), between(energyDataTable.timestamp, start, end)))
		.groupBy(energyDataTable.sensorId, sql`grouper`)
		.orderBy(sql`grouper`);

	return data.map((row, index) => ({
		...row,
		id: index.toString(),
	}));
}

export const getEnergyForSensorInRange = cache(
	async (
		startDate: string,
		endDate: string,
		sensorId: string,
		aggregation: "raw" | "hour" | "weekday" | "day" | "week" | "calendar-week" | "month" | "year" = "raw",
		type: "sum" | "average" = "average",
	) => {
		const start = new Date(startDate);
		const end = new Date(endDate);

		switch (aggregation) {
			case "raw":
				return getRawEnergyForSensorInRange(start, end, sensorId);
			case "hour":
				return getHourEnergyForSensorInRange(start, end, sensorId, type);
			case "weekday":
				return getWeekdayEnergyForSensorInRange(start, end, sensorId, type);
			case "day":
				return getDayEnergyForSensorInRange(start, end, sensorId, type);
			case "week":
				return getWeekOfMonthEnergyForSensorInRange(start, end, sensorId, type);
			case "calendar-week":
				return getWeekEnergyForSensorInRange(start, end, sensorId, type);
			case "month":
				return getMonthEnergyForSensorInRange(start, end, sensorId, type);
			case "year":
				return getYearEnergyForSensorInRange(start, end, sensorId, type);
			default:
				throw new Error(`Unsupported aggregation type: ${aggregation}`);
		}
	},
);

export const getEnergySumForSensorInRange = cache(async (start: Date, end: Date, sensorId: string) => {
	const data = await db
		.select({
			sum: sql`SUM(${energyDataTable.consumption})`.mapWith((value) => Number(value)),
		})
		.from(energyDataTable)
		.where(and(eq(energyDataTable.sensorId, sensorId), between(energyDataTable.timestamp, start, end)))
		.groupBy(energyDataTable.sensorId)
		.limit(1);

	if (data.length === 0) {
		return 0;
	}

	return data[0].sum;
});

export const getEnergyLastEntry = cache(async (sensorId: string) => {
	const query = await db
		.select({
			id: energyDataTable.id,
			sensorId: energyDataTable.sensorId,
			value: energyDataTable.value,
			consumption: energyDataTable.consumption,
			valueOut: energyDataTable.valueOut,
			inserted: energyDataTable.inserted,
			valueCurrent: energyDataTable.valueCurrent,
			timestamp: energyDataTable.timestamp,
		})
		.from(energyDataTable)
		.where(eq(energyDataTable.sensorId, sensorId))
		.orderBy(desc(energyDataTable.timestamp))
		.limit(1);

	if (query.length === 0) {
		return null;
	}

	return query[0];
});
