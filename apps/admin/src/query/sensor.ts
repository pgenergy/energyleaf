import {
    getSensorsByUser as getSensorsByUserDb,
    getSensorsWithUser as getSensorsWithUserDb,
} from "@energyleaf/postgres/query/sensor";
import type { SensorSelectTypeWithUser } from "@energyleaf/postgres/types";
import { cache } from "react";

export const getSensorsByUser = cache(async (id: string) => {
    return getSensorsByUserDb(id);
});

export const getSensors: () => Promise<SensorSelectTypeWithUser[]> = cache(async () => {
    return getSensorsWithUserDb();
});
