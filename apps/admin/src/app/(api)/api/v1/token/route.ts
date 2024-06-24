import { createSensorToken, getSensorDataByClientId, log, logError } from "@energyleaf/db/query";
import { energyleaf, parseReadableStream } from "@energyleaf/proto";
import { waitUntil } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";

const { TokenRequest, TokenResponse } = energyleaf;

export const POST = async (req: NextRequest) => {
    const body = req.body;

    if (!body) {
        waitUntil(log("request-unauthorized/missing-body", "error", "accepting-script", "api", req));

        return new NextResponse(TokenResponse.toBinary({ status: 400, statusMessage: "No body" }), {
            status: 400,
            headers: {
                "Content-Type": "application/x-protobuf",
            },
        });
    }

    try {
        const binaryData = await parseReadableStream(body);
        const data = TokenRequest.fromBinary(binaryData);

        console.info(data);

        try {
            const code = await createSensorToken(data.clientId);
            const sensorData = await getSensorDataByClientId(data.clientId);
            if (!sensorData) {
                waitUntil(log("sensor/not-found", "error", "sensor-token", "api", req));

                return new NextResponse(TokenResponse.toBinary({ statusMessage: "Sensor not found", status: 404 }), {
                    status: 404,
                    headers: {
                        "Content-Type": "application/x-protobuf",
                    },
                });
            }

            if ((sensorData.needsScript || data.needScript) && sensorData.script) {
                let perRotation: number | undefined = undefined;
                const additionalData: {
                    script: string | undefined;
                    analogRotationPerKwh: number | undefined;
                } = {
                    script: undefined,
                    analogRotationPerKwh: undefined,
                };
                if (sensorData.script.split("\n").length === 1 && sensorData.script.match(/^\d+$/)) {
                    perRotation = Number.parseInt(sensorData.script);
                    additionalData.analogRotationPerKwh = perRotation;
                } else {
                    additionalData.script = sensorData.script;
                }
                waitUntil(log("sensor/sent-script", "info", "sensor-token", "api", { sensorData, data }));
                return new NextResponse(
                    TokenResponse.toBinary({
                        status: 200,
                        accessToken: code,
                        expiresIn: 3600,
                        ...additionalData,
                    }),
                    {
                        status: 200,
                        headers: {
                            "Content-Type": "application/x-protobuf",
                        },
                    },
                );
            }
            waitUntil(log("sensor/token-sent", "info", "sensor-token", "api", { sensorData, data, code }));
            return new NextResponse(
                TokenResponse.toBinary({
                    accessToken: code,
                    expiresIn: 3600,
                    status: 200,
                }),
                {
                    status: 200,
                    headers: {
                        "Content-Type": "application/x-protobuf",
                    },
                },
            );
        } catch (err) {
            if (
                (err as unknown as Error).message === "sensor/not-found" ||
                (err as unknown as Error).message === "sensor/no-user"
            ) {
                waitUntil(logError("sensor/not-found", "sensor-token", "api", data, err));
                return new NextResponse(TokenResponse.toBinary({ statusMessage: "Sensor not found", status: 404 }), {
                    status: 404,
                    headers: {
                        "Content-Type": "application/x-protobuf",
                    },
                });
            }

            waitUntil(logError("internal/database-error", "sensor-token", "api", data, err));
            return new NextResponse(TokenResponse.toBinary({ statusMessage: "Database error", status: 500 }), {
                status: 500,
                headers: {
                    "Content-Type": "application/x-protobuf",
                },
            });
        }
    } catch (e) {
        waitUntil(logError("internal/invalid-data", "sensor-token", "api", req, e));
        return new NextResponse(TokenResponse.toBinary({ statusMessage: "Invalid data", status: 400 }), {
            status: 400,
            headers: {
                "Content-Type": "application/x-protobuf",
            },
        });
    }
};
