"use server";

import { getActionSession } from "@/lib/auth/auth.action";
import type { peakSchema } from "@/lib/schema/peak";
import {
    getDevicesByPeak as getDevicesByPeakDb,
    updateDevicesForPeak as updateDevicesForPeakDb,
} from "@energyleaf/db/query";
import { UserNotLoggedInError } from "@energyleaf/lib/errors/auth";
import { revalidatePath } from "next/cache";
import "server-only";
import { getDevicesByUser as getDbDevicesByUser } from "@energyleaf/db/query";
import type { z } from "zod";

export async function updateDevicesForPeak(data: z.infer<typeof peakSchema>, sensorDataId: string) {
    try {
        const { session } = await getActionSession();

        if (!session) {
            throw new UserNotLoggedInError();
        }

        const devices = data.device.map((device) => device.id);
        try {
            await updateDevicesForPeakDb(sensorDataId, devices);
        } catch (e) {
            return {
                success: false,
                message: "Es gab einen Fehler mit den Peaks.",
            };
        }
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um die Peaks zu bearbeiten.",
            };
        }

        return {
            success: false,
            message: "Es ist ein Fehler aufgetreten.",
        };
    }
    revalidatePath("/dashboard");
}

export async function getDevicesByUser(userId: string, search?: string) {
    return getDbDevicesByUser(userId, search);
}

export async function getDevicesByPeak(sensorDataId: string) {
    return getDevicesByPeakDb(sensorDataId);
}
