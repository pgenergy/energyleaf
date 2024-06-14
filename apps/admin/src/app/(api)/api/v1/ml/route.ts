import { type NextRequest, NextResponse } from "next/server";
import { parseReadableStream, energyleaf_ml } from "@energyleaf/proto";
const { DeviceClassificationRequest, DeviceClassificationResponse } = energyleaf_ml;
import { env } from "@/env.mjs";

export const POST = async (req: NextRequest) => {
    const body = await req.json();

    if (!body) {
        return NextResponse.json({
            status: 400
        });
    }

    try {
        const ml_req = DeviceClassificationRequest.create(body);
        const ml_res = await fetch(`${env.ML_API_URL}/classify_input`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-protobuf",
                "x-api-key": env.ML_API_KEY
            },
            body: DeviceClassificationRequest.toBinary(ml_req)
        });

        if (!ml_res.body) {
            return NextResponse.error();
        }

        const binaryData = await parseReadableStream(ml_res.body);
        const data = DeviceClassificationResponse.fromBinary(binaryData);

        return NextResponse.json(data);

    } catch (e) {
        // eslint-disable-next-line no-console -- we need to log the error in the production logs
        console.error(e);
        return NextResponse.error();
    }
};
