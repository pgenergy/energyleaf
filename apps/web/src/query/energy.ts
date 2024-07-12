import { env } from "@/env.mjs";
import { getDemoSensorData } from "@/lib/demo/demo";
import {
    getAvgEnergyConsumptionForSensor as getDbAvgEnergyConsumptionForSensor,
    getAvgEnergyConsumptionForUserInComparison as getDbAvgEnergyConsumptionForUserInComparison,
    getElectricitySensorIdForUser as getDbElectricitySensorIdForUser,
    getEnergyForSensorInRange as getDbEnergyForSensorInRange,
    getEnergyLastEntry as getDbEnergyLastEntry,
} from "@energyleaf/db/query";
import { AggregationType } from "@energyleaf/lib";
import { cache } from "react";
import "server-only";

interface DeviceClassification {
    timestamp: string;
    power: number;
    dominantClassification: string;
    classification: Record<string, number>;
}

export const getEnergyDataForSensor = cache(
    async (start: Date, end: Date, sensorId: string, aggregation = AggregationType.RAW) => {
        if (sensorId === "demo_sensor") {
            return { data: getDemoSensorData(start, end), classifications: [] };
        }
        const energyData = await getDbEnergyForSensorInRange(start, end, sensorId, aggregation);
        let classifications: DeviceClassification[] = [];

        if (energyData && energyData.length > 0) {
            try {
                classifications = await classifyDeviceUsage(energyData);
            } catch (error) {
                console.error("Error in device classification: ", error);
            }
        }

        return { data: energyData, classifications };
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

export const getEnergyLastEntry = cache(async (sensorId: string) => {
    if (sensorId === "demo_sensor") {
    }

    return getDbEnergyLastEntry(sensorId);
});

export const classifyDeviceUsage = async (sensorData) => {
    const req_data = {
        electricity: sensorData.map((data) => ({
            timestamp: data.timestamp,
            power: data.value,
        })),
    };

    try {
        const response = await fetch(`http://${env.ADMIN_URL}/api/v1/ml`, {
            method: "POST",
            headers: {
                Authorization: env.ML_API_KEY,
            },
            body: JSON.stringify(req_data),
        });

        /*if (!response.ok) {

            console.error(`API Error: Failed to classify devices, status code: ${response.status}, error: ${errorText}`);
            throw new Error(`API Error: Failed to classify devices, status code: ${response.status}, error: ${errorText}`);
        }*/

        const errorText = await response.text();
        console.log(errorText);

        return JSON.parse(errorText).electricity;
    } catch (error) {
        console.error("Error in device classification: ", error);
        throw error;
    }
};
