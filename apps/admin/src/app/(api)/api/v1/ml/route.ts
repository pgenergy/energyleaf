import { energyleaf_ml, parseReadableStream } from "@energyleaf/proto";
import { type NextRequest, NextResponse } from "next/server";
const { DeviceClassificationRequest, DeviceClassificationResponse } = energyleaf_ml;
import { env } from "@/env.mjs";

export const POST = async (req: NextRequest) => {
    const mlApiKey = env.ML_API_KEY;
    if (!req.headers.has("Authorization") || req.headers.get("Authorization") !== mlApiKey) {
        return NextResponse.json({}, { status: 401 });
    }

    const body = await req.json();

    if (!body) {
        return NextResponse.json({}, { status: 400 });
    }

    try {
        const ml_req = DeviceClassificationRequest.create(body);
        const ml_res = await fetch(`${env.ML_API_URL}/classify_devices`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-protobuf",
                "x-api-key": env.ML_API_KEY,
            },
            body: DeviceClassificationRequest.toBinary(ml_req),
        });

        if (!ml_res.body) {
            return NextResponse.error();
        }

        const binaryData = await parseReadableStream(ml_res.body);
        const data = DeviceClassificationResponse.fromBinary(binaryData);

        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.error();
    }
};
