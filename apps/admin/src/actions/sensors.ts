"use server";

import type { SensorWithUser } from "@energyleaf/db/query";
import {
    assignSensorToUser as assignSensorToUserDb,
    createSensor as createSensorDb,
    deleteSensor as deleteSensorDb,
    getSensorsWithUser as getSensorsWithUserDb,
    sensorExists,
} from "@energyleaf/db/query";

import "server-only";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/auth";
import type { assignUserToSensorSchema } from "@/lib/schema/sensor";
import type { z } from "zod";

import type { SensorType } from "@energyleaf/db/schema";
import { UserNotLoggedInError } from "@energyleaf/lib";

/**
 * Creates a new sensor.
 */
export async function createSensor(macAddress: string, sensorType: SensorType): Promise<void> {
    await checkIfAdmin();
    await createSensorDb({
        macAddress,
        sensorType,
    });
    revalidatePath("/sensors");
}

export async function isSensorRegistered(macAddress: string): Promise<boolean> {
    await checkIfAdmin();
    return sensorExists(macAddress);
}

export async function getSensors(): Promise<SensorWithUser[]> {
    await checkIfAdmin();
    return getSensorsWithUserDb();
}

export async function deleteSensor(sensorId: string) {
    await checkIfAdmin();
    try {
        await deleteSensorDb(sensorId);
        revalidatePath("/sensors");
    } catch (e) {
        throw new Error("Error while deleting sensor");
    }
}

export async function assignUserToSensor(data: z.infer<typeof assignUserToSensorSchema>, clientId: string) {
    await checkIfAdmin();
    try {
        await assignSensorToUserDb(clientId, data.userId);
        revalidatePath("/sensors");
    } catch (e) {
        throw new Error("Error while assigning user to sensor");
    }
}

async function checkIfAdmin() {
    const session = await getSession();
    if (!session) {
        throw new UserNotLoggedInError();
    }

    if (!session.user.admin) {
        throw new Error("User is not admin");
    }
}
