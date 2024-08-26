"use server";

import { getPeaksWithoutDevices, logError, saveDeviceToPeakDb } from "@energyleaf/db/query";
import "server-only";
import { mlApi } from "@/actions/ml";
import { waitUntil } from "@vercel/functions";

const deviceNameMapping = {
    fridge: "Kühlschrank",
    freezer: "Gefrierschrank",
    micro_wave_oven: "Mikrowelle",
    dishwasher: "Spülmaschine",
    washing_machine: "Waschmaschine",
};

export async function classifyAndSaveDevicesForPeaks(peaks: { id: string }[], userId: string) {
    try {
        const peaksToClassify = await getPeaksWithoutDevices(peaks);

        if (peaksToClassify.length === 0) {
            return;
        }

        const response = await mlApi({ peaks: peaksToClassify });

        for (const peak of response.peaks) {
            const devicesToSave = peak.devices
                .filter((device) => device.confidence >= 0.9)
                .map((device) => ({
                    name: deviceNameMapping[device.name] || device.name,
                    confidence: device.confidence,
                }));

            if (devicesToSave.length > 0) {
                await saveDevicesToPeak(peak.id, devicesToSave, userId);
            }
        }
    } catch (error) {
        waitUntil(
            logError("device/classification-error", "classifyAndSaveDevicesForPeaks", "web", { peaks, userId }, error),
        );
        throw new Error("Fehler bei der Geräteklassifikation und Speicherung.");
    }
}

async function saveDevicesToPeak(peakId: string, devices: { name: string }[], userId: string) {
    try {
        for (const device of devices) {
            await saveDeviceToPeakDb(peakId, device.name, userId);
        }
    } catch (error) {
        waitUntil(
            logError("device/save-to-peak-error", "saveDevicesToPeak", "web", { peakId, devices, userId }, error),
        );
        throw new Error("Fehler beim Speichern der Geräte für den Peak.");
    }
}
