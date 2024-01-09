import { cache } from "react";

import {
    getAvgEnergyConsumptionForUser as getDbAvgEnergyConsumptionForUser,
    getAvgEnergyConsumptionForUserInComparison as getDbAvgEnergyConsumptionForUserInComparison,
    getEnergyForUserInRange,
    getPeaksByUser,
} from "@energyleaf/db/query";

export const getEnergyDataForUser = cache(async (start: Date, end: Date, userId: string) => {
    return getEnergyForUserInRange(start, end, Number(userId));
});

export const getAvgEnergyConsumptionForUser = cache(async (userId: string) => {
    return getDbAvgEnergyConsumptionForUser(Number(userId));
});

export const getAvgEnergyConsumptionForUserInComparison = cache(async (userId: string) => {
    return getDbAvgEnergyConsumptionForUserInComparison(Number(userId));
});

export const getPeaksForUser = cache(async (start: Date, end: Date, userId: string) => {
    return getPeaksByUser(start, end, Number(userId));
});
