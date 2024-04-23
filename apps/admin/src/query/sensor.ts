import { cache } from "react";

import {
    getSensorsByUser as getSensorsByUserDb,
    getSensorsWithUser as getSensorsWithUserDb,
    calculateAnomaly as getAnomaliesByUserDb
} from "@energyleaf/db/query";
import type { SensorSelectTypeWithUser } from "@energyleaf/db/types";

export const getSensorsByUser = cache(async (id: string) => {
    return getSensorsByUserDb(id);
});

export const getSensors: () => Promise<SensorSelectTypeWithUser[]> = cache(async () => {
    return getSensorsWithUserDb();
});

export const getAnomaliesByUser = cache(async (id, start, end) => {
    return getAnomaliesByUserDb(id, start, end);
});
