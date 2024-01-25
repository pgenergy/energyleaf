"use server";

import crypto from 'node:crypto';
import type {
    SensorWithUser
} from '@energyleaf/db/query';
import {
    sensorExists
} from '@energyleaf/db/query';
import {
    getSensorsWithUser as getSensorsWithUserDb,
    createSensor as createSensorDb
} from '@energyleaf/db/query';

import 'server-only';
import {getSession} from "@/lib/auth/auth";
import type {SensorType} from "@energyleaf/db/schema";
import {revalidatePath} from "next/cache";
import {UserNotLoggedInError} from "@energyleaf/lib";

/**
 * Generates a new unique sensor key.
 * 
 * @returns a 40 character long hex string
 */
function createUniqueSensorKey(): string {
    return crypto.randomBytes(20).toString('hex')
}

/**
 * Creates a new sensor.
 */
export async function createSensor(macAddress: string, sensorType: SensorType): Promise<void> {
    await checkIfAdmin();

    const sensorKey: string = await createUniqueSensorKey();
    await createSensorDb({
        key: sensorKey,
        macAddress,
        sensorType
    });
    revalidatePath("/sensors");
}

export async function isSensorRegistered(macAddress: string): Promise<boolean> {
    await checkIfAdmin();
    return await sensorExists(macAddress);
}

export async function getSensors() : Promise<SensorWithUser[]>  {
    await checkIfAdmin()
    return getSensorsWithUserDb()
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