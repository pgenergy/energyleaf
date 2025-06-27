import { genID } from "@/lib/utils";
import { db } from "@/server/db";
import { and, desc, eq, lt } from "drizzle-orm";
import { energyDataTable, sensorTable, sensorTokenTable } from "../db/tables/sensor";
import { lower } from "../db/types";
// import "server-only";
import { SensorType } from "@/lib/enums";
import { cache } from "react";

export async function createSensorToken(clientId: string) {
	const dbReturn = await db.transaction(async (trx) => {
		const sensorData = await trx
			.select()
			.from(sensorTable)
			.where(eq(lower(sensorTable.clientId), clientId.toLowerCase()));
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

		const tokenData = await trx
			.select()
			.from(sensorTokenTable)
			.where(eq(sensorTokenTable.sensorId, sensorData[0].id));
		if (tokenData.length > 0) {
			await trx.delete(sensorTokenTable).where(eq(sensorTokenTable.sensorId, sensorData[0].id));
		}

		const code = genID(30);
		await trx.insert(sensorTokenTable).values({
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

export async function getSensorIdFromSensorToken(code: string) {
	const dbReturn = await db.transaction(async (trx) => {
		const tokenData = await trx.select().from(sensorTokenTable).where(eq(sensorTokenTable.code, code));

		if (tokenData.length === 0) {
			return {
				error: "token/not-found",
				sensorId: null,
			};
		}

		const token = tokenData[0];
		const tokenDate = token.timestamp;

		if (!tokenDate) {
			await trx.delete(sensorTokenTable).where(eq(sensorTokenTable.sensorId, token.sensorId));
			return {
				error: "token/invalid",
				sensorId: null,
			};
		}

		// check if token is older than 1 hour
		const now = new Date();
		if (now.getTime() - tokenDate.getTime() > 3600000) {
			await trx.delete(sensorTokenTable).where(eq(sensorTokenTable.sensorId, token.sensorId));
			return {
				error: "token/invalid",
				sensorId: null,
			};
		}

		const sensorData = await trx.select().from(sensorTable).where(eq(sensorTable.id, token.sensorId));
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
			sensor: sensorData[0],
		};
	});

	const { error, sensor } = dbReturn;

	if (error) {
		throw new Error(error);
	}

	if (!sensor) {
		throw new Error("sensor/not-found");
	}

	return sensor;
}

interface EnergyDataInput {
	sensorId: string;
	value: number;
	valueOut?: number;
	valueCurrent?: number;
	sum: boolean;
	timestamp: Date;
}

export const getEnergySensorIdForUser = cache(async (userId: string) => {
	if (userId === "demo") {
		return "demo_sensor";
	}
	const sensors = await db
		.select({
			id: sensorTable.id,
		})
		.from(sensorTable)
		.where(and(eq(sensorTable.userId, userId), eq(sensorTable.sensorType, SensorType.Electricity)))
		.limit(1);

	if (sensors.length === 0) {
		return null;
	}

	return sensors[0].id;
});

export async function insertEnergyData(data: EnergyDataInput) {
	await db.transaction(async (trx) => {
		const dbSensors = await trx.select().from(sensorTable).where(eq(sensorTable.id, data.sensorId));

		if (dbSensors.length === 0) {
			throw new Error("Sensor not found");
		}
		const dbSensor = dbSensors[0];

		const lastEntries = await trx
			.select()
			.from(energyDataTable)
			.where(and(eq(energyDataTable.sensorId, dbSensor.id), lt(energyDataTable.timestamp, data.timestamp)))
			.orderBy(desc(energyDataTable.timestamp))
			.limit(1);

		if (lastEntries.length === 0) {
			const newValue = data.value;
			if (newValue <= 0) {
				return;
			}
			await trx.insert(energyDataTable).values({
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

		// in this check we allow 0.6 kwh per minute
		// so for 15 seconds which is currently the sensor rate we allow 0.15 kwh
		// in an hour this would be 36 kwh
		// this is a very high value and should never be reached
		// but is hopefully a good protection against faulty sensors
		// if we didnt recieve a value for more than one day we ignore the threshold and accept the next value
		const timeDiff = (data.timestamp.getTime() - lastEntry.timestamp.getTime()) / 1000 / 60;
		const timeThreshold = 0.6;
		if (newValue - lastEntry.value > timeDiff * timeThreshold && timeDiff < 24 * 60) {
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

		await trx.insert(energyDataTable).values({
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
