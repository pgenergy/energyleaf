import { cache } from "react";

import {
    getAvgEnergyConsumptionForSensor as getDbAvgEnergyConsumptionForSensor,
    getAvgEnergyConsumptionForUserInComparison as getDbAvgEnergyConsumptionForUserInComparison,
    getEnergyForUserInRange,
    getPeaksByUser,
} from "@energyleaf/db/query";

export const getEnergyDataForSensor = cache(async (start: Date, end: Date, sensorId: string) => {
    return getEnergyForSensorInRange(start, end, sensorId);
});

export const getAvgEnergyConsumptionForSensor = cache(async (sensorId: string) => {
    return getDbAvgEnergyConsumptionForSensor(sensorId);
});

export const getAvgEnergyConsumptionForUserInComparison = cache(async (userId: string) => {
    return getDbAvgEnergyConsumptionForUserInComparison(Number(userId));
});

export const getElectricitySensorIdForUser = cache(async (userId: string) => {
    return getDbElectricitySensorIdForUser(Number(userId));
});

export const getElectricitySensorIdForUser = cache(async (userId: string) => {
    return getDbElectricitySensorIdForUser(Number(userId));
});

export const getPeaksForUser = cache(async (start: Date, end: Date, userId: string) => {
    return getPeaksByUser(start, end, Number(userId));
});