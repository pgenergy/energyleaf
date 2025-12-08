import { and, asc, between, eq, or, type SQLWrapper } from "drizzle-orm";
import { cache } from "react";
import { db } from "../db";
import { deviceTable, deviceToPeakTable } from "../db/tables/device";
import {
	type EnergyData,
	type EnergyDataSequence,
	energyDataSequenceTable,
	energyDataTable,
} from "../db/tables/sensor";

interface Peak {
	id: string;
	start: Date;
	end: Date;
}

interface GroupedPeaks {
	weekStart: Date;
	weekEnd: Date;
	peaks: Peak[];
}

export const getWeeklyGroupedPeaks = cache(async (deviceId: string) => {
	const peaksWithDevice = await getPeaksByDevice(deviceId);
	if (!peaksWithDevice || peaksWithDevice.length === 0) {
		return [];
	}

	const timeOfEarliestPeak = peaksWithDevice[0].start;
	const groupedPeaks: GroupedPeaks[] = [];
	const weekStart = new Date(timeOfEarliestPeak);

	while (weekStart < new Date()) {
		let weekEnd = new Date(weekStart);
		weekEnd.setDate(weekEnd.getDate() + 7);

		if (weekEnd > new Date()) {
			weekEnd = new Date();
		}

		const peaksInWeek: Peak[] = peaksWithDevice
			.filter((peak) => peak.start >= weekStart && peak.start < weekEnd)
			.map((peak) => ({
				id: peak.id,
				start: peak.start,
				end: peak.end,
			}));
		groupedPeaks.push({
			weekStart: new Date(weekStart),
			weekEnd,
			peaks: peaksInWeek,
		});
		weekStart.setDate(weekStart.getDate() + 7);
	}
	return groupedPeaks;
});

interface ExtraQuerySequencesBySensorProps {
	start: string;
	end: string;
}

export const getPeaksBySensor = cache(async (sensorId: string, extra?: ExtraQuerySequencesBySensorProps) => {
	const wheres: (SQLWrapper | undefined)[] = [eq(energyDataSequenceTable.sensorId, sensorId)];
	if (extra) {
		const start = new Date(extra.start);
		const end = new Date(extra.end);
		wheres.push(
			or(between(energyDataSequenceTable.start, start, end), between(energyDataSequenceTable.end, start, end)),
		);
	}

	const rawData = await db
		.select()
		.from(energyDataSequenceTable)
		.innerJoin(
			energyDataTable,
			between(energyDataTable.timestamp, energyDataSequenceTable.start, energyDataSequenceTable.end),
		)
		.where(and(...wheres))
		.orderBy(asc(energyDataSequenceTable.start), asc(energyDataTable.timestamp));

	const groupedDataMap: Map<string, EnergyDataSequence & { energyData: EnergyData[] }> = new Map();

	for (const item of rawData) {
		const { energy_data_sequence, energy_data } = item;
		if (groupedDataMap.has(energy_data_sequence.id)) {
			groupedDataMap.get(energy_data_sequence.id)?.energyData.push(energy_data);
		} else {
			groupedDataMap.set(energy_data_sequence.id, {
				...energy_data_sequence,
				energyData: [energy_data],
			});
		}
	}

	return Array.from(groupedDataMap.values());
});

export const getDevicesByPeak = cache(async (energyDataSequenceId: string) => {
	return db
		.select({
			id: deviceToPeakTable.deviceId,
			name: deviceTable.name,
			category: deviceTable.category,
		})
		.from(deviceToPeakTable)
		.innerJoin(deviceTable, eq(deviceTable.id, deviceToPeakTable.deviceId))
		.where(eq(deviceToPeakTable.energyDataSequenceId, energyDataSequenceId));
});

export const getPeaksByDevice = cache(async (deviceId: string) => {
	return db
		.select({
			id: energyDataSequenceTable.id,
			start: energyDataSequenceTable.start,
			end: energyDataSequenceTable.end,
		})
		.from(deviceToPeakTable)
		.innerJoin(energyDataSequenceTable, eq(energyDataSequenceTable.id, deviceToPeakTable.energyDataSequenceId))
		.where(eq(deviceToPeakTable.deviceId, deviceId))
		.orderBy(asc(energyDataSequenceTable.start));
});

export const getPeakById = cache(async (id: string) => {
	const peaks = await db.select().from(energyDataSequenceTable).where(eq(energyDataSequenceTable.id, id)).limit(1);
	if (!peaks || peaks.length === 0) {
		return null;
	}

	return peaks[0];
});
