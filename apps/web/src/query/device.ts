import { getDemoDevicesCookieStore, getDemoDevicesFromPeaksCookieStore } from "@/lib/demo/demo";
import { getDevicesByPeak as getDbDevicesByPeak, getDevicesByUser as getDbDevicesByUser } from "@energyleaf/db/query";
import { cookies } from "next/headers";
import { cache } from "react";
import "server-only";

/**
 * Cached query to retrieve the devices per user.
 */
export const getDevicesByUser = cache(async (id: string) => {
    if (id === "demo") {
        return getDemoDevicesCookieStore(cookies());
    }

    return getDbDevicesByUser(id);
});

/**
 * Cached query to retrieve the devices per peak.
 */
export const getDevicesByPeak = cache(async (sequenceId: string, userId: string) => {
    if (userId === "demo") {
        return getDemoDevicesFromPeaksCookieStore(cookies(), sequenceId);
    }

    return getDbDevicesByPeak(sequenceId);
});
