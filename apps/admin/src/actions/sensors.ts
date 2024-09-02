"use server";

import { checkIfAdmin } from "@/lib/auth/auth.action";
import type { assignUserToSensorSchema } from "@/lib/schema/sensor";
import { type AggregationType, UserHasSensorOfSameType } from "@energyleaf/lib";
import { getEnergyForSensorInRange } from "@energyleaf/postgres/query/energy-get";
import { insertRawEnergyValue } from "@energyleaf/postgres/query/energy-insert";
import {
    assignSensorToUser as assignSensorToUserDb,
    createSensor as createSensorDb,
    resetSensorValues as dbResetSensorValues,
    deleteSensor as deleteSensorDb,
    getElectricitySensorIdForUser,
    sensorExists,
    updateSensor as updateSensorDb,
} from "@energyleaf/postgres/query/sensor";
import type { SensorInsertType, SensorType } from "@energyleaf/postgres/types";
import { revalidatePath } from "next/cache";
import "server-only";
import type { z } from "zod";

/**
 * Creates a new sensor.
 */
export async function createSensor(macAddress: string, sensorType: SensorType, script?: string) {
    try {
        const admin = await checkIfAdmin();
        if (!admin) {
            return {
                success: false,
                message: "Keine Berechtigung.",
            };
        }
        await createSensorDb({
            macAddress,
            sensorType,
            script: script !== "" ? script : undefined,
        });
    } catch (err) {
        return {
            success: false,
            message: "Fehler beim Erstellen des Sensors.",
        };
    }
    revalidatePath("/sensors");
}

/**
 * Update an existing sensor.
 */
export async function updateSensor(sensorId: string, data: Partial<SensorInsertType>) {
    if (data.script === "") {
        data.script = null;
    }
    try {
        const admin = await checkIfAdmin();
        if (!admin) {
            return {
                success: false,
                message: "Keine Berechtigung.",
            };
        }
        await updateSensorDb(sensorId, data);
    } catch (e) {
        throw new Error("Error while updating sensor");
    }
    revalidatePath("/sensors");
}

export async function isSensorRegistered(macAddress: string): Promise<boolean> {
    try {
        await checkIfAdmin();
    } catch (err) {
        return false;
    }
    return sensorExists(macAddress);
}

export async function getElectricitySensorByUser(id: string) {
    try {
        await checkIfAdmin();
    } catch (err) {
        return null;
    }
    return getElectricitySensorIdForUser(id);
}

export async function getConsumptionBySensor(
    sensorId: string,
    startDate: Date,
    endDate: Date,
    aggregationType: AggregationType,
) {
    try {
        await checkIfAdmin();
    } catch (err) {
        return [];
    }
    return getEnergyForSensorInRange(startDate, endDate, sensorId, aggregationType);
}

export async function deleteSensor(sensorId: string) {
    try {
        const admin = await checkIfAdmin();
        if (!admin) {
            return {
                success: false,
                message: "Keine Berechtigung.",
            };
        }
        await deleteSensorDb(sensorId);
        revalidatePath("/sensors");
    } catch (err) {
        return {
            success: false,
            message: "Fehler beim Löschen des Sensors.",
        };
    }
}

export async function assignUserToSensor(data: z.infer<typeof assignUserToSensorSchema>, clientId: string) {
    try {
        const admin = await checkIfAdmin();
        if (!admin) {
            return {
                success: false,
                message: "Keine Berechtigung.",
            };
        }
        const newId = await assignSensorToUserDb(clientId, data.userId);
        revalidatePath("/sensors");

        return {
            success: true,
            message: "Der Sensor wurde erfolgreich zum Benutzer zugeordnet.",
            payload: newId,
        };
    } catch (err) {
        if (err instanceof UserHasSensorOfSameType) {
            return {
                success: false,
                message: "Der Benutzer hat bereits einen Sensor dieses Typs zugewiesen.",
            };
        }
        return {
            success: false,
            message: "Fehler beim Zuweisen",
        };
    }
}

export async function resetSensorValues(clientId: string) {
    try {
        const admin = await checkIfAdmin();
        if (!admin) {
            return {
                success: false,
                message: "Keine Berechtigung.",
            };
        }
        await dbResetSensorValues(clientId);
        revalidatePath("/sensors");
    } catch (err) {
        return {
            success: false,
            message: "Fehler beim Zurücksetzen der Sensorwerte.",
        };
    }
}

export async function insertSensorValue(sensorId: string, value: number) {
    try {
        const admin = await checkIfAdmin();
        if (!admin) {
            return {
                success: false,
                message: "Keine Berechtigung.",
            };
        }
        await insertRawEnergyValue(sensorId, value);
    } catch (err) {
        return {
            success: false,
            message: "Fehler beim Eintragen der Sensorwerte.",
        };
    }
}
