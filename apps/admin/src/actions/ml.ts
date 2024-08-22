"use server";

import { env } from "@/env.mjs";
import { energyleaf_ml, parseReadableStream } from "@energyleaf/proto";

const { DeviceClassificationPeakRequest, DeviceClassificationPeakResponse } = energyleaf_ml;

export interface RequestProps {
    peaks: {
        peak_id: string;
        electricity: {
            timestamp: string;
            power: number;
        }[];
    }[];
}

export const mlApi = async (body: RequestProps) => {
    if (!body) {
        throw new Error("Missing or empty body");
    }

    const ml_req = DeviceClassificationPeakRequest.create(body);

    if (!env.ML_API_KEY) {
        throw Error("env-variable/not-defined");
    }

    const ml_res = await fetch(`${env.ML_API_URL}/classify_devices`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-protobuf",
            "x-api-key": env.ML_API_KEY,
        },
        body: DeviceClassificationPeakRequest.toBinary(ml_req),
    });

    if (!ml_res.body) {
        throw Error("ml-api/missing-body");
    }

    const binaryData = await parseReadableStream(ml_res.body);
    const data = DeviceClassificationPeakResponse.fromBinary(binaryData);

    return data;
};
