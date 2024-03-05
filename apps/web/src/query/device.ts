import { cache } from "react";

import "server-only";

import { cookies } from "next/headers";
import { getDemoSensorData, getDevicesCookieStore, getPeaksCookieStore } from "@/lib/demo/demo";

import {
    getAverageConsumptionPerDevice as getAverageConsumptionPerDeviceDb,
    getDevicesByUser as getDbDevicesByUser,
} from "@energyleaf/db/query";

/**
 * Cached query to retrieve the devices per user.
 */
export const getDevicesByUser = cache(async (id: string) => {
    if (id === "demo") {
        return getDevicesCookieStore(cookies());
    }
    return getDbDevicesByUser(id);
});

export const getAverageConsumptionPerDevice = cache(async (userId: string) => {
    if (userId === "demo") {
        const start = new Date(new Date().setHours(0, 0, 0, 0));
        const end = new Date(new Date().setHours(23, 59, 59, 999));
        const peaks = getPeaksCookieStore(cookies());
        const sensorData = getDemoSensorData(start, end);

        const peakAssignment = peaks.map((p) => {
            return {
                peaks: p,
                sensor_data: sensorData.find((s) => s.timestamp.getTime() === p.timestamp.getTime()) || null,
            };
        });

        const result: { deviceId: number; averageConsumption: number }[] = [];
        for (const device of getDevicesCookieStore(cookies())) {
            const devicePeaks = peakAssignment.filter((p) => Number(p.peaks.deviceId) === Number(device.id));
            const consumption = devicePeaks.reduce((acc, cur) => {
                if (cur.sensor_data) {
                    return acc + cur.sensor_data.value;
                }
                return acc;
            }, 0);
            result.push({
                deviceId: device.id,
                averageConsumption: consumption / devicePeaks.length,
            });
        }
        return result;
    }
    return getAverageConsumptionPerDeviceDb(userId);
});
