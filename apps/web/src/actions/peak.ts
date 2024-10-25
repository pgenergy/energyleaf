"use server";

import { getActionSession } from "@/lib/auth/auth.action";
import type { peakSchema } from "@/lib/schema/peak";
import { UserNotLoggedInError } from "@energyleaf/lib/errors/auth";
import { updatePowerOfDevices } from "@energyleaf/postgres/query/device";
import { log, logError, trackAction } from "@energyleaf/postgres/query/logs";
import {
    getDevicesByPeak as getDevicesByPeakDb,
    updateDevicesForPeak as updateDevicesForPeakDb,
} from "@energyleaf/postgres/query/peaks";
import { revalidatePath } from "next/cache";
import "server-only";
import {
    assignDemoDevicesToPeaks,
    getDemoDevicesCookieStore,
    getDemoDevicesFromPeaksCookieStore,
    updateDemoPowerEstimationForDevices,
} from "@/lib/demo/demo";
import type { DeviceOption, DeviceSelection } from "@/lib/devices/types";
import type { DefaultActionReturnPayload } from "@energyleaf/lib";
import { getDevicesByUser as getDbDevicesByUser } from "@energyleaf/postgres/query/device";
import type { DeviceCategory } from "@energyleaf/postgres/types";
import { waitUntil } from "@vercel/functions";
import type { Session } from "lucia";
import { cookies } from "next/headers";
import type { z } from "zod";

export async function updateDevicesForPeak(data: z.infer<typeof peakSchema>, sensorDataId: string) {
    let session: Session | null = null;
    try {
        const { session: actionSession, user } = await getActionSession();
        session = actionSession;

        if (!session || !user) {
            waitUntil(log("user/not-logged-in", "error", "update-devices-for-peak", "web", { data }));
            throw new UserNotLoggedInError();
        }

        const devices = data.device.map((device) => device.deviceId).filter((id) => id !== undefined);

        // handle demo
        if (user.id === "demo") {
            // No devices need to be added since suggestions are not part of the demo.
            assignDemoDevicesToPeaks(cookies(), sensorDataId, devices);
            await updateDemoPowerEstimationForDevices(cookies());
            revalidatePath("/dashboard");
            revalidatePath("/devices");
            revalidatePath("/energy");
            return;
        }

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
    revalidatePath("/devices");
    revalidatePath("/energy");
}

export async function getDevicesByUser(userId: string, search?: string) {
    const { session, user } = await getActionSession();

    // handle demo
    if (user?.id === "demo") {
        return getDemoDevicesCookieStore(cookies());
    }

    const devices = getDbDevicesByUser(userId, search);
    waitUntil(trackAction("peak/get-devices", "get-devices-by-user", "web", { search, devices, session }));
    return devices;
}

export async function getDevicesByPeak(sensorDataSequenceId: string) {
    const { session, user } = await getActionSession();

    // handle demo
    if (user?.id === "demo") {
        return getDemoDevicesFromPeaksCookieStore(cookies(), sensorDataSequenceId);
    }

    const devices = await getDevicesByPeakDb(sensorDataSequenceId);
    waitUntil(
        trackAction("peak/get-devices", "get-devices-by-peak", "web", { sensorDataSequenceId, devices, session }),
    );
    return devices;
}

export async function getDeviceOptionsByPeak(
    sensorDataSequenceId: string,
): Promise<DefaultActionReturnPayload<DeviceSelection>> {
    const { user } = await getActionSession();

    if (!user) {
        return {
            success: false,
            message: "Sie müssen angemeldet sein, um ausgewählte Geräte für Peaks zu bearbeiten.",
        };
    }

    const selectedDevices = await getDevicesByPeak(sensorDataSequenceId);
    const allDevices: DeviceOption[] = (await getDevicesByUser(user.id)).map((device) => {
        return {
            id: device.id.toString(),
            category: device.category as DeviceCategory,
            name: device.name,
            deviceId: device.id,
            isSelected: selectedDevices.some((selectedDevice) => selectedDevice.id === device.id),
        };
    });

    return {
        success: true,
        payload: {
            options: allDevices,
        },
        message: "Geräteoptionen erfolgreich geladen.",
    };
}
