"use server";

import { checkIfAdmin } from "@/lib/auth/auth.action";
import type { assignUserToSensorSchema } from "@/lib/schema/sensor";
import {
    assignSensorToUser as assignSensorToUserDb,
    createSensor as createSensorDb,
    deleteSensor as deleteSensorDb,
    deleteUserFromSensor,
    getElectricitySensorIdForUser,
    getEnergyForSensorInRange,
    insertRawSensorValue,
    sensorExists,
    updateSensor as updateSensorDb,
} from "@energyleaf/db/query";
import type { SensorInsertType, SensorType } from "@energyleaf/db/types";
import type { AggregationType } from "@energyleaf/lib";
import { revalidatePath } from "next/cache";
import "server-only";
import type { z } from "zod";

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

export async function getElectricitySensorByUser(id: string) {
    await checkIfAdmin();
    return getElectricitySensorIdForUser(id);
}

export async function getConsumptionBySensor(
    sensorId: string,
    startDate: Date,
    endDate: Date,
    aggregationType: AggregationType,
) {
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
        const newId = await assignSensorToUserDb(clientId, data.userId);
        revalidatePath("/sensors");

        return {
            success: true,
            message: "Der Sensor wurde erfolgreich zum Benutzer zugeordnet.",
            payload: newId,
        };
    } catch (err) {
        if ((err as unknown as Error).message === "sensor/user-has-sensor-of-type") {
            return {
                success: false,
                message: "Der Benutzer hat bereits einen Sensor dieses Typs zugewiesen.",
            }
        }
        return {
            success: false,
            message: "Fehler beim Zuweisen",
        };
    }
}

export async function removeUserFromSensor(clientId: string) {
    await checkIfAdmin();

    try {
        await deleteUserFromSensor(clientId);
        revalidatePath("/sensors");
    } catch (err) {
        throw new Error("Error while removing user from sensor");
    }
}

export async function insertSensorValue(sensorId: string, value: number) {
    await checkIfAdmin();

    try {
        await insertRawSensorValue(sensorId, value);
    } catch (err) {
        throw new Error("Error while inserting sensor value");
    }
}
