import {
    getSensorsByUser as getSensorsByUserDb,
    getSensorsWithUser as getSensorsWithUserDb,
} from "@energyleaf/db/query";
import type { SensorSelectTypeWithUser } from "@energyleaf/db/types";
import { cache } from "react";

export const getSensorsByUser = cache(async (id: string) => {
    return getSensorsByUserDb(id);
});

export const getSensors: () => Promise<SensorSelectTypeWithUser[]> = cache(async () => {
    return getSensorsWithUserDb();
});
