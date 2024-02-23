"use server";

import type {
    SensorWithUser
} from '@energyleaf/db/query';
import {
    sensorExists
} from '@energyleaf/db/query';
import {
    getSensorsWithUser as getSensorsWithUserDb,
    createSensor as createSensorDb,
    deleteSensor as deleteSensorDb,
    assignSensorToUser as assignSensorToUserDb
} from '@energyleaf/db/query';

import 'server-only';
import {getSession} from "@/lib/auth/auth";
import type {SensorType} from "@energyleaf/db/schema";
import {revalidatePath} from "next/cache";
import {type baseInformationSchema, UserNotLoggedInError} from "@energyleaf/lib";
import type {z} from "zod";
import {assignUserToSensorSchema} from "@/lib/schema/sensor";

/**
 * Creates a new sensor.
 */
export async function createSensor(macAddress: string, sensorType: SensorType): Promise<void> {
    await checkIfAdmin();
    await createSensorDb({
        macAddress,
        sensorType
    });
    revalidatePath("/sensors");
}

export async function isSensorRegistered(macAddress: string): Promise<boolean> {
    await checkIfAdmin();
    return sensorExists(macAddress);
}

export async function getSensors() : Promise<SensorWithUser[]>  {
    await checkIfAdmin()
    return getSensorsWithUserDb()
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

export async function assignUserToSensor(data: z.infer<typeof assignUserToSensorSchema>, sensorId: string) {
    await checkIfAdmin();
    try {
        await assignSensorToUserDb(sensorId, data.userId)
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