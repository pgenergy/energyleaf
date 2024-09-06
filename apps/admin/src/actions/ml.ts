"use server";

import { env } from "@/env.mjs";
import { energyleaf_ml, parseReadableStream } from "@energyleaf/proto";

import { getPeaksWithoutDevices, saveDeviceSuggestionsToPeakDb } from "@energyleaf/postgres/query/device";
import { logError } from "@energyleaf/postgres/query/logs";
import "server-only";
import { DeviceCategory } from "@energyleaf/postgres/types";
import { waitUntil } from "@vercel/functions";

const deviceCategoryMapping: Record<string, DeviceCategory> = {
    fridge: DeviceCategory.Fridge,
    freezer: DeviceCategory.Freezer,
    micro_wave_oven: DeviceCategory.Microwave,
    dishwasher: DeviceCategory.Dishwasher,
    washing_machine: DeviceCategory.WashingMachine,
};

const { DeviceClassificationPeakRequest, DeviceClassificationPeakResponse } = energyleaf_ml;

export interface RequestProps {
    peaks: {
        id: string;
        electricity: {
            timestamp: string;
            power: number;
        }[];
    }[];
}

const mlApi = async (body: RequestProps) => {
    if (!env.ML_API_KEY) {
        throw Error("env-variable/not-defined");
    }

    const mlReq = DeviceClassificationPeakRequest.create(body);

    const mlRes = await fetch(`${env.ML_API_URL}/classify_devices`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-protobuf",
            "x-api-key": env.ML_API_KEY,
        },
        body: DeviceClassificationPeakRequest.toBinary(mlReq),
    });

    if (!mlRes.body) {
        throw Error("ml-api/missing-body");
    }

    const binaryData = await parseReadableStream(mlRes.body);
    const data = DeviceClassificationPeakResponse.fromBinary(binaryData);

    return data;
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
                await saveDeviceSuggestionsToPeakDb(peak.id, devicesToSave);
            }
        }
    } catch (error) {
        waitUntil(
            logError("device/classification-error", "classifyAndSaveDevicesForPeaks", "web", { peaks, userId }, error),
        );
    }
}
