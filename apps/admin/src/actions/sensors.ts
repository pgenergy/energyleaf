"use server";

import {
    assignSensorToUser as assignSensorToUserDb,
    createSensor as createSensorDb,
    deleteSensor as deleteSensorDb, getElectricitySensorIdForUser, getEnergyForSensorInRange,
    sensorExists,
    updateSensor as updateSensorDb,
} from "@energyleaf/db/query";

import "server-only";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/auth";
import type { assignUserToSensorSchema } from "@/lib/schema/sensor";
import type { z } from "zod";

import type {AggregationType, SensorInsertType, SensorType} from "@energyleaf/db/util";
import { UserNotLoggedInError } from "@energyleaf/lib";

/**
 * Creates a new sensor.
 */
export async function createSensor(macAddress: string, sensorType: SensorType, script?: string): Promise<void> {
    await checkIfAdmin();
    await createSensorDb({
        macAddress,
        sensorType,
        script: script !== "" ? script : undefined,
    });
    revalidatePath("/sensors");
}

/**
 * Update an existing sensor.
 */
export async function updateSensor(sensorId: string, data: Partial<SensorInsertType>) {
    await checkIfAdmin();
    if (data.script === "") {
        data.script = null;
    }
    try {
        await updateSensorDb(sensorId, data);
    } catch (e) {
        throw new Error("Error while updating sensor");
    }
    revalidatePath("/sensors");
}

export async function isSensorRegistered(macAddress: string): Promise<boolean> {
    await checkIfAdmin();
    return sensorExists(macAddress);
}

export async function getElectricitySensorByUser(id: number) {
    await checkIfAdmin();
    return getElectricitySensorIdForUser(id);
}

export async function getConsumptionBySensor(sensorId: string, startDate: Date, endDate: Date, aggregationType: AggregationType) {
    await checkIfAdmin();
    return getEnergyForSensorInRange(startDate, endDate, sensorId, aggregationType);
}

export async function deleteSensor(sensorId: string) {
    await checkIfAdmin();
    await deleteSensorDb(sensorId);
    revalidatePath("/sensors");
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
