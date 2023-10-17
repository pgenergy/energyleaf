import { cache } from "react";

import {
    getAvgEnergyConsumptionForUser as getDbAvgEnergyConsumptionForUser,
    getEnergyForUserInRange,
    getAvgEnergyConsumptionForUserInComparison as getDbAvgEnergyConsumptionForUserInComparison,
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

