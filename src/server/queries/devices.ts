import "server-only";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "../db";
import { Device, deviceTable } from "../db/tables/device";

export const getDevicesByUser = cache(async (userId: string) => {
	if (userId === "demo") {
		const cookieStore = await cookies();
		const devices = cookieStore.get("devices") ?? null;
		if (!devices) {
			return [];
		}

		return JSON.parse(devices.value) as Device[];
	}
	return db.select().from(deviceTable).where(eq(deviceTable.userId, userId));
});

export const getDeviceById = cache(async (userId: string, deviceId: string) => {
	if (userId === "demo") {
		const cookieStore = await cookies();
		const devices = cookieStore.get("devices") ?? null;
		if (!devices) {
			return null;
		}
		const devicesJson = JSON.parse(devices.value) as Device[];
		const device = devicesJson.find((d) => d.id === deviceId);
		if (!device) {
			return null;
		}
		return device;
	}
	const devices = await db
		.select()
		.from(deviceTable)
		.where(and(eq(deviceTable.id, deviceId), eq(deviceTable.userId, userId)));
	if (!devices || devices.length === 0) {
		return null;
	}

	return devices[0];
});
