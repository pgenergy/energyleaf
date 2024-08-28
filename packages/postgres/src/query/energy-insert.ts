import { and, desc, eq, lt } from "drizzle-orm";
import { db, genId } from "..";
import { sensorDataTable, sensorTable } from "../schema/sensor";

export async function insertRawEnergyValues(
    data: {
        id: string;
        value: number;
        timestamp: Date;
        sensorId: string;
    }[],
) {
    await db.insert(sensorDataTable).values(data);
}

export async function insertRawEnergyValue(sensorId: string, value: number) {
    return insertRawEnergyValues([
        {
            id: genId(30),
            value,
            sensorId,
            timestamp: new Date(),
        },
    ]);
}

interface SensorDataInput {
    sensorId: string;
    value: number;
    valueOut?: number;
    valueCurrent?: number;
    sum: boolean;
    timestamp: Date;
}

export async function insertSensorData(data: SensorDataInput) {
    await db.transaction(async (trx) => {
        const dbSensors = await trx.select().from(sensorTable).where(eq(sensorTable.id, data.sensorId));

        if (dbSensors.length === 0) {
            throw new Error("Sensor not found");
        }
        const dbSensor = dbSensors[0];

        const lastEntries = await trx
            .select()
            .from(sensorDataTable)
            .where(and(eq(sensorDataTable.sensorId, dbSensor.id), lt(sensorDataTable.timestamp, data.timestamp)))
            .orderBy(desc(sensorDataTable.timestamp))
            .limit(1);

        if (lastEntries.length === 0) {
            const newValue = data.value;
            if (newValue <= 0) {
                return;
            }
            await trx.insert(sensorDataTable).values({
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
        const timeDiff = (new Date().getTime() - lastEntry.timestamp.getTime()) / 1000 / 60;
        if (newValue - lastEntry.value > timeDiff * 0.6) {
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

        await trx.insert(sensorDataTable).values({
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
