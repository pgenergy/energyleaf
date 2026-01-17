import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "../db";
import { type Device, deviceTable, deviceToPeakTable } from "../db/tables/device";
import { energyDataSequenceTable } from "../db/tables/sensor";
import { userDataTable } from "../db/tables/user";

export const getDevicesByUser = cache(async (userId: string) => {
	if (userId === "demo") {
		const cookieStore = await cookies();
		const devices = cookieStore.get("devices") ?? null;
		if (!devices) {
			return [];
		}

		return (JSON.parse(devices.value) as Device[]).map((device) => ({
			...device,
			powerEstimationConfidence: null,
		}));
	}
	return db
		.select({
			id: deviceTable.id,
			userId: deviceTable.userId,
			name: deviceTable.name,
			category: deviceTable.category,
			created: deviceTable.created,
			timestamp: deviceTable.timestamp,
			power: deviceTable.power,
			isPowerEstimated: deviceTable.isPowerEstimated,
			weeklyUsageEstimation: deviceTable.weeklyUsageEstimation,
			powerEstimationConfidence: sql<
				number | null
			>`ROUND(LEAST(1, GREATEST(0, ${userDataTable.devicePowerEstimationRSquared}::numeric)) * LEAST(1, (COUNT(${deviceToPeakTable.energyDataSequenceId})::numeric / 5)) * 100)::int`,
		})
		.from(deviceTable)
		.leftJoin(userDataTable, eq(userDataTable.userId, deviceTable.userId))
		.leftJoin(deviceToPeakTable, eq(deviceToPeakTable.deviceId, deviceTable.id))
		.leftJoin(energyDataSequenceTable, eq(energyDataSequenceTable.id, deviceToPeakTable.energyDataSequenceId))
		.where(eq(deviceTable.userId, userId))
		.groupBy(deviceTable.id, userDataTable.devicePowerEstimationRSquared);
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
		return {
			...device,
			powerEstimationConfidence: null,
		};
	}
	const devices = await db
		.select({
			id: deviceTable.id,
			userId: deviceTable.userId,
			name: deviceTable.name,
			category: deviceTable.category,
			created: deviceTable.created,
			timestamp: deviceTable.timestamp,
			power: deviceTable.power,
			isPowerEstimated: deviceTable.isPowerEstimated,
			weeklyUsageEstimation: deviceTable.weeklyUsageEstimation,
			powerEstimationConfidence: sql<
				number | null
			>`ROUND(LEAST(1, GREATEST(0, ${userDataTable.devicePowerEstimationRSquared}::numeric)) * LEAST(1, (COUNT(${deviceToPeakTable.energyDataSequenceId})::numeric / 5)) * 100)::int`,
		})
		.from(deviceTable)
		.leftJoin(userDataTable, eq(userDataTable.userId, deviceTable.userId))
		.leftJoin(deviceToPeakTable, eq(deviceToPeakTable.deviceId, deviceTable.id))
		.leftJoin(energyDataSequenceTable, eq(energyDataSequenceTable.id, deviceToPeakTable.energyDataSequenceId))
		.where(and(eq(deviceTable.id, deviceId), eq(deviceTable.userId, userId)))
		.groupBy(deviceTable.id, userDataTable.devicePowerEstimationRSquared);
	if (!devices || devices.length === 0) {
		return null;
	}

	return devices[0];
});
