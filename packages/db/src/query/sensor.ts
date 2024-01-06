import { and, between, eq, or, sql } from "drizzle-orm";

import db from "..";
import { sensorData, userData, sensor } from "../schema";

/**
 * Get the energy consumption for a sensor in a given time range
 */
export async function getEnergyForSensorInRange(start: Date, end: Date, sensorId: string) {
    return db
        .select()
        .from(sensorData)
        .where(
            and(
                eq(sensorData.sensorId, sensorId),
                between(sensorData.timestamp, start, end)
            ),
        )
        .orderBy(sensorData.timestamp);
}

/**
 * Get the average energy consumption for a sensor
 */
export async function getAvgEnergyConsumptionForSensor(sensorId: string) {
    const query = await db
        .select({
            sensorId: sensorData.sensorId,
            avg: sql<string>`AVG(${sensorData.value})`,
        })
        .from(sensorData)
        .where(eq(sensorData.sensorId, sensorId));

    if (query.length === 0) {
        return null;
    }

    return Number(query[0].avg);
}

/**
 * get the average energy consumption for a user in comparison to other users with similar data
 */
export async function getAvgEnergyConsumptionForUserInComparison(userId: number) {
    const query = await db.transaction(async (trx) => {
        const data = await trx.select().from(userData).where(eq(userData.userId, userId));

        if (data.length === 0) {
            return null;
        }

        const user = data[0];
        if (!user.livingSpace || !user.household || !user.property) {
            return null;
        }

        const avg = await trx
            .select({
                avg: sql<string>`AVG(${sensorData.value})`,
                count: sql<string>`COUNT(DISTINCT ${sensor.id})`,
            })
            .from(sensorData)
            .innerJoin(sensor, eq(sensor.id, sensorData.sensorId))
            .innerJoin(userData, eq(userData.id, sensor.user_id))
            .where(
                and(
                    eq(userData.livingSpace, user.livingSpace),
                    eq(userData.household, user.household),
                    eq(userData.property, user.property),
                ),
            )
            .groupBy(userData.wohnfläche, userData.household, userData.immobilie);

        if (avg.length === 0) {
            return null;
        }

        return {
            avg: Number(avg[0].avg),
            count: Number(avg[0].count),
        };
    });

    return query;
}

/**
 * Get the sensorId for a user where sensor_type is 'electricity'
 */
export async function getElectricitySensorIdForUser(userId: number) {
    const query = await db
        .select()
        .from(sensor)
        .where(
            and(
                eq(sensor.user_id, userId),
                eq(sensor.sensor_type, 'electricity')
            )
        );

    if (query.length === 0) {
        return null;
    }

    const sensorId = query[0].id;

    return sensorId;
}
