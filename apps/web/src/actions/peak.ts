"use server";

import { getActionSession } from "@/lib/auth/auth.action";
import type { peakSchema } from "@/lib/schema/peak";
import {
    getDevicesByPeak as getDevicesByPeakDb,
    log,
    logError,
    trackAction,
    updateDevicesForPeak as updateDevicesForPeakDb,
    updatePowerOfDevices,
} from "@energyleaf/db/query";
import { UserNotLoggedInError } from "@energyleaf/lib/errors/auth";
import { revalidatePath } from "next/cache";
import "server-only";
import { getDevicesByUser as getDbDevicesByUser } from "@energyleaf/db/query";
import { waitUntil } from "@vercel/functions";
import type { Session } from "lucia";
import type { z } from "zod";

export async function updateDevicesForPeak(data: z.infer<typeof peakSchema>, sensorDataId: string) {
    let session: Session | null = null;
    try {
        session = (await getActionSession())?.session;

        if (!session) {
            waitUntil(log("user/not-logged-in", "error", "update-devices-for-peak", "web", { data }));
            throw new UserNotLoggedInError();
        }

        const devices = data.device.map((device) => device.id);
        try {
            await updateDevicesForPeakDb(sensorDataId, devices);
            await updatePowerOfDevices(session.userId);
            waitUntil(trackAction("peak/update-devices", "update-devices-for-peak", "web", { data, session }));
        } catch (e) {
            waitUntil(logError("peak/error-updating-devices", "update-devices-for-peak", "web", { data, session }, e));
            return {
                success: false,
                message: "Es gab einen Fehler mit den Peaks.",
            };
        }
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            waitUntil(logError("user/not-logged-in", "update-devices-for-peak", "web", { data }, err));
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um die Peaks zu bearbeiten.",
            };
        }
        waitUntil(logError("peak/error", "update-devices-for-peak", "web", { data, session }, err));
        return {
            success: false,
            message: "Es ist ein Fehler aufgetreten.",
        };
    }
    revalidatePath("/dashboard");
}

export async function getDevicesByUser(userId: string, search?: string) {
    const session = (await getActionSession())?.session;
    const devices = getDbDevicesByUser(userId, search);
    waitUntil(trackAction("peak/get-devices", "get-devices-by-user", "web", { search, devices, session }));
    return devices;
}

export async function getDevicesByPeak(sensorDataSequenceId: string) {
    const { session } = await getActionSession();
    const devices = getDevicesByPeakDb(sensorDataSequenceId);
    waitUntil(
        trackAction("peak/get-devices", "get-devices-by-peak", "web", { sensorDataSequenceId, devices, session }),
    );
    return devices;
}
