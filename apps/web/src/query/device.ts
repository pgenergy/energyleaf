import { getDevicesByPeak as getDbDevicesByPeak, getDevicesByUser as getDbDevicesByUser } from "@energyleaf/db/query";
import { cache } from "react";
import "server-only";

/**
 * Cached query to retrieve the devices per user.
 */
export const getDevicesByUser = cache(async (id: string) => {
    return getDbDevicesByUser(id);
});

/**
 * Cached query to retrieve the devices per peak.
 */
export const getDevicesByPeak = cache(async (sequenceId: string) => {
    return getDbDevicesByPeak(sequenceId);
});
