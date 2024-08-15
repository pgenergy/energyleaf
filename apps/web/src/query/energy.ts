import { getDemoLastEnergyEntry, getDemoPeaks, getDemoSensorData } from "@/lib/demo/demo";
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
            return getDemoSensorData(start, end, aggregation);
        }
        return getDbEnergyForSensorInRange(start, end, sensorId, aggregation, aggType);
    },
);

export const getAvgEnergyConsumptionForSensor = cache(async (sensorId: string) => {
    if (sensorId === "demo_sensor") {
        const demoStart = new Date(new Date().setHours(0, 0, 0, 0));
        const demoEnd = new Date(new Date().setHours(23, 59, 59, 999));
        const data = await getDemoSensorData(demoStart, demoEnd);
        return data.reduce((acc, cur) => acc + cur.value, 0) / data.length;
    }
    return getDbAvgEnergyConsumptionForSensor(sensorId);
});

export const getAvgEnergyConsumptionForUserInComparison = cache(async (userId: string) => {
    if (userId === "demo") {
        const demoStart = new Date(new Date().setHours(0, 0, 0, 0));
        const demoEnd = new Date(new Date().setHours(23, 59, 59, 999));
        const data = await getDemoSensorData(demoStart, demoEnd);
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
        return getDemoLastEnergyEntry();
    }

    return getDbEnergyLastEntry(sensorId);
});

type ExtraSequencesProps = {
    start: Date;
    end: Date;
};

export const getSensorDataSequences = cache(async (sensorId: string, extra?: ExtraSequencesProps) => {
    if (sensorId === "demo_sensor") {
        if (!extra) {
            return [];
        }
        return getDemoPeaks(extra.start, extra.end);
    }

    return getSequencesBySensor(sensorId, extra);
});
