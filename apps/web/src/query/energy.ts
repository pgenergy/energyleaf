import { getDemoLastEnergyEntry, getDemoPeaks, getDemoSensorData } from "@/lib/demo/demo";
import { AggregationType } from "@energyleaf/lib";
import {
    getEnergyLastEntry as getDbEnergyLastEntry,
    getEnergyForSensorInRange,
} from "@energyleaf/postgres/query/energy-get";
import { getSequencesBySensor } from "@energyleaf/postgres/query/peaks";
import { getElectricitySensorIdForUser as getDbElectricitySensorIdForUser } from "@energyleaf/postgres/query/sensor";
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
            return getDemoSensorData(start, end, aggregation, aggType);
        }
        return getEnergyForSensorInRange(start, end, sensorId, aggregation, aggType);
    },
);

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
