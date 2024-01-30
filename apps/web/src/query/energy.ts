import { cache } from "react";

import {
    getAvgEnergyConsumptionForSensor as getDbAvgEnergyConsumptionForSensor,
    getAvgEnergyConsumptionForUserInComparison as getDbAvgEnergyConsumptionForUserInComparison,
    getElectricitySensorIdForUser as getDbElectricitySensorIdForUser,
    getEnergyForSensorInRange as getDbEnergyForSensorInRange,
    getPeaksBySensor as getDbPeaksBySensor,
} from "@energyleaf/db/query";
import { AggregationType } from "@energyleaf/db/util";

export const getEnergyDataForSensor = cache(
    async (start: Date, end: Date, sensorId: string, aggregation = AggregationType.RAW) => {
        return getDbEnergyForSensorInRange(start, end, sensorId, aggregation);
    },
);

export const getAvgEnergyConsumptionForSensor = cache(async (sensorId: string) => {
    return getDbAvgEnergyConsumptionForSensor(sensorId);
});

export const getAvgEnergyConsumptionForUserInComparison = cache(async (userId: string) => {
    return getDbAvgEnergyConsumptionForUserInComparison(Number(userId));
});

export const getElectricitySensorIdForUser = cache(async (userId: string) => {
    return getDbElectricitySensorIdForUser(Number(userId));
});

export const getPeaksBySensor = cache(async (start: Date, end: Date, sensorId: string) => {
    return getDbPeaksBySensor(start, end, sensorId);
});
