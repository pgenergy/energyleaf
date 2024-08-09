import { getDemoSensorData } from "@/lib/demo/demo";
import {
    getAvgEnergyConsumptionForSensor as getDbAvgEnergyConsumptionForSensor,
    getAvgEnergyConsumptionForUserInComparison as getDbAvgEnergyConsumptionForUserInComparison,
    getElectricitySensorIdForUser as getDbElectricitySensorIdForUser,
    getEnergyForSensorInRange as getDbEnergyForSensorInRange,
    getEnergyLastEntry as getDbEnergyLastEntry,
    getSequencesBySensor,
} from "@energyleaf/db/query";
import { AggregationType } from "@energyleaf/lib";
import { cache } from "react";
import "server-only";
import { mlApi } from "@/actions/ml";
import type { SensorDataSelectType, SensorDataSequenceType } from "@energyleaf/db/types";

export interface DeviceClassification {
    timestamp: string;
    power: number;
    dominantClassification: string;
    classification: Record<string, number>;
}

export const getEnergyDataForSensor = cache(
    async (
        startDate: string,
        endDate: string,
        sensorId: string,
        aggregation = AggregationType.RAW,
        aggType: "sum" | "average" = "average",
    ) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (sensorId === "demo_sensor") {
            return getDemoSensorData(start, end);
        }
        return getDbEnergyForSensorInRange(start, end, sensorId, aggregation, aggType);
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
        const start = new Date(new Date().setHours(0, 0, 0, 0));
        const end = new Date(new Date().setHours(23, 59, 59, 999));
        const data = getDemoSensorData(start, end);
        const sum = data.reduce((acc, cur) => acc + cur.value, 0);
        const last = data[data.length - 1];
        last.value = sum * 12.32334;

        return last;
    }

    return getDbEnergyLastEntry(sensorId);
});

export const classifyDeviceUsage = async (peaks: SensorDataSequenceType[], sensorData: SensorDataSelectType[]) => {
    const req_data = {
        peaks: peaks.map(peak => ({
            id: peak.id,
            electricity: sensorData
                .filter(data => data.timestamp >= peak.start && data.timestamp <= peak.end)
                .map(data => ({
                    timestamp: data.timestamp.toISOString(),
                    power: data.value,
                })),
        })),
    };

    try {
        const response = await mlApi(req_data);
        return response.peaks;
    } catch (error) {
        console.error("Error in device classification: ", error);
        throw error;
    }
};

type ExtraSequencesProps = {
    start: Date;
    end: Date;
};

export const getSensorDataSequences = cache(async (sensorId: string, extra?: ExtraSequencesProps) => {
    if (sensorId === "demo_sensor") {
        return []; // Does not exist in demo version.
    }

    return getSequencesBySensor(sensorId, extra);
});
