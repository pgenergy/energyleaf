import { env } from "@/env.mjs";
import { log } from "@energyleaf/postgres/query/logs";
import { energyleaf_ml, parseReadableStream } from "@energyleaf/proto";
import { waitUntil } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";

const { DeviceClassificationRequest, DeviceClassificationResponse } = energyleaf_ml;

export const POST = async (req: NextRequest) => {
    const mlApiKey = env.ML_API_KEY;
    if (!req.headers.has("Authorization") || req.headers.get("Authorization") !== mlApiKey) {
        waitUntil(log("request-unauthorized/missing-key", "error", "ml-communication", "api", req));
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body) {
        waitUntil(log("request-unauthorized/missing-body", "error", "ml-communication", "api", req));
        return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    try {
        const ml_req = DeviceClassificationRequest.create(body);

        if (!env.ML_API_KEY) {
            waitUntil(log("env-variable/not-defined", "error", "ml-communication", "api", req));
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }

        const ml_res = await fetch(`${env.ML_API_URL}/v4/classify_devices`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-protobuf",
                "x-api-key": env.ML_API_KEY,
            },
            body: DeviceClassificationRequest.toBinary(ml_req),
        });

        if (!ml_res.body) {
            waitUntil(log("ml-api/missing-body", "error", "ml-communication", "api", req));
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }

        const binaryData = await parseReadableStream(ml_res.body);
        const data = DeviceClassificationResponse.fromBinary(binaryData);

        return NextResponse.json(data);
    } catch (e) {
        waitUntil(log("ml-api/unhandled-exception", "error", "ml-communication", "api", req));
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
