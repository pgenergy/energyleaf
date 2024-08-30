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
import {
    assignDemoDevicesToPeaks,
    getDemoDevicesCookieStore,
    getDemoDevicesFromPeaksCookieStore,
    updateDemoPowerEstimationForDevices,
} from "@/lib/demo/demo";
import { getDevicesByUser as getDbDevicesByUser } from "@energyleaf/db/query";
import { DeviceCategory, DeviceCategoryTitles } from "@energyleaf/db/types";
import type { DefaultActionReturnPayload } from "@energyleaf/lib";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
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

        const devices = data.device.map((device) => device.id);

        // handle demo
        if (user.id === "demo") {
            assignDemoDevicesToPeaks(cookies(), sensorDataId, devices);
            updateDemoPowerEstimationForDevices(cookies());
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

// TODO: Maybe verschieben
export interface DeviceOption {
    id: string;
    category: DeviceCategory;
    name: string;
    isSuggested: boolean;
    isDraft: boolean;
    isSelected: boolean;
    deviceId?: number;
}

export interface DeviceSelection {
    hasSuggestions: boolean;
    options: DeviceOption[];
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
            isSuggested: false,
            isDraft: false,
            deviceId: device.id,
            isSelected: selectedDevices.some((selectedDevice) => selectedDevice.id === device.id),
        };
    });

    let hasSuggestions = false;
    if (fulfills(user.appVersion, Versions.support) && selectedDevices.length === 0) {
        const suggestions = await getDeviceSuggestionsByPeak(sensorDataSequenceId);
        const suggestedCategories = new Set(suggestions.map((suggestion) => suggestion.deviceCategory));
        console.log("Suggested Categories", suggestedCategories);

        for (const device of allDevices.filter((device) => suggestedCategories.has(device.category))) {
            console.log("Setting device as suggested", device);
            device.isSuggested = true;
            device.isSelected = true;
        }

        const existingCategories = new Set(allDevices.map((device) => device.category));
        const newCategories = new Set(
            [...Array.from(suggestedCategories)].filter((category) => !existingCategories.has(category)),
        );
        const maxDeviceId = Math.max(...allDevices.map((device) => device.deviceId ?? 0));
        const draftDevices: DeviceOption[] = Array.from(newCategories).map((category) => {
            return {
                id: maxDeviceId + category,
                category: category,
                name: DeviceCategoryTitles[category],
                isSuggested: true,
                isDraft: true,
                isSelected: true,
            };
        });
        allDevices.push(...draftDevices);

        hasSuggestions = suggestions.length > 0;
    }

    return {
        success: true,
        payload: {
            hasSuggestions: hasSuggestions,
            options: allDevices,
        },
        message: "Geräteoptionen erfolgreich geladen.",
    };
}

export async function getDeviceSuggestionsByPeak(sensorDataSequenceId: string) {
    const { user } = await getActionSession();

    // TODO: Correct load from DB
    return [
        {
            id: 1,
            deviceCategory: DeviceCategory.Fridge,
            sensorDataSequenceId: sensorDataSequenceId,
        },
        {
            id: 2,
            deviceCategory: DeviceCategory.WashingMachine,
            sensorDataSequenceId: sensorDataSequenceId,
        },
    ];
}
