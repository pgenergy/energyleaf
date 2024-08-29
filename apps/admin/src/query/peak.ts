"use server";

import { getPeaksWithoutDevices, logError, saveDeviceSuggestionsToPeakDb } from "@energyleaf/db/query";
import "server-only";
import { mlApi } from "@/actions/ml";
import { DeviceCategory } from "@energyleaf/db/types";
import { waitUntil } from "@vercel/functions";

const deviceCategoryMapping: Record<string, DeviceCategory> = {
    fridge: DeviceCategory.Fridge,
    freezer: DeviceCategory.Freezer,
    micro_wave_oven: DeviceCategory.Microwave,
    dishwasher: DeviceCategory.Dishwasher,
    washing_machine: DeviceCategory.WashingMachine,
};

export async function classifyAndSaveDevicesForPeaks(
    peaks: { id: string; electricity: { timestamp: string; power: number }[] }[],
    userId: string,
) {
    try {
        const peaksToClassifyIds = await getPeaksWithoutDevices(peaks.map((peak) => ({ id: peak.id })));

        if (peaksToClassifyIds.length === 0) {
            return;
        }

        const peaksToClassify = peaks.filter((peak) =>
            peaksToClassifyIds.some((peakToClassify) => peakToClassify.id === peak.id),
        );

        const response = await mlApi({ peaks: peaksToClassify });

        for (const peak of response.peaks) {
            const devicesToSave = peak.devices
                .filter((device) => device.confidence >= 0.9)
                .map((device) => deviceCategoryMapping[device.name]);

            if (devicesToSave.length > 0) {
                await saveDevicesToPeak(peak.id, devicesToSave);
            }
        }
    } catch (error) {
        waitUntil(
            logError("device/classification-error", "classifyAndSaveDevicesForPeaks", "web", { peaks, userId }, error),
        );
        throw new Error("Fehler bei der Geräteklassifikation und Speicherung.");
    }
}

async function saveDevicesToPeak(peakId: string, devices: DeviceCategory[]) {
    await saveDeviceSuggestionsToPeakDb(peakId, devices);
}
