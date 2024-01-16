"use server";

import crypto from 'node:crypto';
import { createSensor as createSensorDb } from '@energyleaf/db/query';

import 'server-only';

/**
 * Generates a new unique sensor key.
 * 
 * @returns a 40 character long hex string
 */
export async function createUniqueSensorKey(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        crypto.randomBytes(20, (err, buf) => {
            if (err) {
                reject(err);
            } else {
                resolve(buf.toString('hex'));
            }
        });
    });
}

/**
 * Creates a new sensor.
 */
export async function createSensor() {
    const sensorKey: string = await createUniqueSensorKey();
    await createSensorDb({
        key: sensorKey,
        macAddress: '00:00:00:00:00:01' // TODO
    });
}