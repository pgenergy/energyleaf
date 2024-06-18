import { getSensorIdFromSensorToken, log, logError, updateNeedsScript } from "@energyleaf/db/query";
import { ScriptAcceptedRequest, ScriptAcceptedResponse, parseReadableStream } from "@energyleaf/proto";
import { waitUntil } from "@vercel/functions";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const { ScriptAcceptedRequest, ScriptAcceptedResponse } = energyleaf;

export const POST = async (req: NextRequest) => {
    const body = req.body;
    if (!body) {
        waitUntil(log("request-unauthorized/missing-body", "error", "accepting-script", "api", req));
        return new NextResponse(ScriptAcceptedResponse.toBinary({ status: 400, statusMessage: "No body" }), {
            status: 400,
            headers: {
                "Content-Type": "application/x-protobuf",
            },
        });
    }

    try {
        const binaryData = await parseReadableStream(body);
        const data = ScriptAcceptedRequest.fromBinary(binaryData);

        try {
            const sensorId = await getSensorIdFromSensorToken(data.accessToken);

            await updateNeedsScript(sensorId, false);
            waitUntil(log("sensor/accepted-script", "info", "accepting-script", "api", data));
            return new NextResponse(ScriptAcceptedResponse.toBinary({ status: 200 }), { status: 200 });
        } catch (err) {
            if ((err as unknown as Error).message === "token/expired") {
                waitUntil(logError("sensor-script/token-expired", "accepting-script", "api", data, err));
                return new NextResponse(
                    ScriptAcceptedResponse.toBinary({ statusMessage: "Token expired", status: 401 }),
                    {
                        status: 401,
                        headers: {
                            "Content-Type": "application/x-protobuf",
                        },
                    },
                );
            }

            if ((err as unknown as Error).message === "token/invalid") {
                waitUntil(logError("sensor-script/token-invalid", "accepting-script", "api", data, err));
                return new NextResponse(
                    ScriptAcceptedResponse.toBinary({ statusMessage: "Token invalid", status: 401 }),
                    {
                        status: 401,
                        headers: {
                            "Content-Type": "application/x-protobuf",
                        },
                    },
                );
            }

            if ((err as unknown as Error).message === "token/not-found") {
                waitUntil(logError("sensor-script/token-not-found", "accepting-script", "api", data, err));
                return new NextResponse(
                    ScriptAcceptedResponse.toBinary({ statusMessage: "Token not found", status: 404 }),
                    {
                        status: 404,
                        headers: {
                            "Content-Type": "application/x-protobuf",
                        },
                    },
                );
            }

            if ((err as unknown as Error).message === "sensor/notfound") {
                waitUntil(logError("sensor-script/sensor-not-found", "accepting-script", "api", data, err));
                return new NextResponse(
                    ScriptAcceptedResponse.toBinary({ statusMessage: "Sensor not found", status: 404 }),
                    {
                        status: 404,
                        headers: {
                            "Content-Type": "application/x-protobuf",
                        },
                    },
                );
            }

            waitUntil(logError("sensor-script/database-error", "accepting-script", "api", req, err));
            return new NextResponse(ScriptAcceptedResponse.toBinary({ statusMessage: "Database error", status: 500 }), {
                status: 500,
                headers: {
                    "Content-Type": "application/x-protobuf",
                },
            });
        }
    } catch (err) {
        waitUntil(logError("sensor-script/unhandled-exception", "accepting-script", "api", req, err));
        return new NextResponse(ScriptAcceptedResponse.toBinary({ status: 400, statusMessage: "Invalid data" }), {
            status: 400,
            headers: {
                "Content-Type": "application/x-protobuf",
            },
        });
    }
};
