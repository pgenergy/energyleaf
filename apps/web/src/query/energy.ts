import { cache } from "react";

import {
    getAvgEnergyConsumptionForSensor as getDbAvgEnergyConsumptionForSensor,
    getAvgEnergyConsumptionForUserInComparison as getDbAvgEnergyConsumptionForUserInComparison,
    getEnergyForSensorInRange, getElectricitySensorIdForUser as getDbElectricitySensorIdForUser,
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
