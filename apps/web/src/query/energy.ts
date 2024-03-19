import { cache } from "react";

import {
    getAvgEnergyConsumptionForSensor as getDbAvgEnergyConsumptionForSensor,
    getAvgEnergyConsumptionForUserInComparison as getDbAvgEnergyConsumptionForUserInComparison,
    getElectricitySensorIdForUser as getDbElectricitySensorIdForUser,
    getEnergyForSensorInRange as getDbEnergyForSensorInRange,
    getPeaksBySensor as getDbPeaksBySensor,
} from "@energyleaf/db/query";

import "server-only";

import { cookies } from "next/headers";
import { getDemoSensorData, getPeaksCookieStore } from "@/lib/demo/demo";

import { AggregationType } from "@energyleaf/lib";

export const getEnergyDataForSensor = cache(
    async (start: Date, end: Date, sensorId: string, aggregation = AggregationType.RAW) => {
        if (sensorId === "demo_sensor") {
            const demoStart = new Date(new Date().setHours(0, 0, 0, 0));
            const demoEnd = new Date(new Date().setHours(23, 59, 59, 999));
            return getDemoSensorData(demoStart, demoEnd);
        }
        return getDbEnergyForSensorInRange(start, end, sensorId, aggregation);
    },
);

export const getAvgEnergyConsumptionForSensor = cache(async (sensorId: string) => {
    if (sensorId === "demo_sensor") {
        const demoStart = new Date(new Date().setHours(0, 0, 0, 0));
        const demoEnd = new Date(new Date().setHours(23, 59, 59, 999));
        const data = getDemoSensorData(demoStart, demoEnd);
        return data.reduce((acc, cur) => acc + cur.value, 0) / data.length;
    }
    return getDbAvgEnergyConsumptionForSensor(sensorId);
});

export const getAvgEnergyConsumptionForUserInComparison = cache(async (userId: string) => {
    if (userId === "demo") {
        const demoStart = new Date(new Date().setHours(0, 0, 0, 0));
        const demoEnd = new Date(new Date().setHours(23, 59, 59, 999));
        const data = getDemoSensorData(demoStart, demoEnd);
        const avg = data.reduce((acc, cur) => acc + cur.value, 0) / data.length;
        const count = data.length;
        return { avg, count };
    }
    return getDbAvgEnergyConsumptionForUserInComparison(userId);
});

export const getElectricitySensorIdForUser = cache(async (userId: string) => {
    if (userId === "demo") {
        return "demo_sensor";
    }
    return getDbElectricitySensorIdForUser(userId);
});

export const getPeaksBySensor = cache(async (start: Date, end: Date, sensorId: string) => {
    if (sensorId === "demo_sensor") {
        const peaks = getPeaksCookieStore(cookies());
        const sensorData = getDemoSensorData(start, end);

        return peaks.map((p) => {
            return {
                peaks: p,
                sensor_data: sensorData.find((s) => s.timestamp.getTime() === p.timestamp.getTime()) || null,
            };
        });
    }

    return getDbPeaksBySensor(start, end, sensorId);
});
