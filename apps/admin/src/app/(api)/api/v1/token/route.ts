import { NextResponse, type NextRequest } from "next/server";

import { createSensorToken, getSensorScript } from "@energyleaf/db/query";
import { TokenRequest, TokenResponse } from "@energyleaf/proto";
import { parseReadableStream } from "@energyleaf/proto/util";

export const POST = async (req: NextRequest) => {
    const body = req.body;

    if (!body) {
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

        try {
            const code = await createSensorToken(data.clientId);
            const scriptData = await getSensorScript(data.clientId);
            if (!scriptData) {
                return new NextResponse(TokenResponse.toBinary({ statusMessage: "Sensor not found", status: 404 }), {
                    status: 404,
                    headers: {
                        "Content-Type": "application/x-protobuf",
                    },
                });
            }

            if (scriptData.needsScript && scriptData.script) {
                return new NextResponse(
                    TokenResponse.toBinary({
                        status: 200,
                        accessToken: code,
                        expiresIn: 3600,
                        script: scriptData.script,
                    }),
                    {
                        status: 200,
                        headers: {
                            "Content-Type": "application/x-protobuf",
                        },
                    },
                );
            }

            return new NextResponse(TokenResponse.toBinary({ accessToken: code, expiresIn: 3600, status: 200 }), {
                status: 200,
                headers: {
                    "Content-Type": "application/x-protobuf",
                },
            });
        } catch (err) {
            if ((err as unknown as Error).message === "sensor/not-found") {
                return new NextResponse(TokenResponse.toBinary({ statusMessage: "Sensor not found", status: 404 }), {
                    status: 404,
                    headers: {
                        "Content-Type": "application/x-protobuf",
                    },
                });
            }

            return new NextResponse(TokenResponse.toBinary({ statusMessage: "Database error", status: 500 }), {
                status: 500,
                headers: {
                    "Content-Type": "application/x-protobuf",
                },
            });
        }
    } catch (e) {
        return new NextResponse(TokenResponse.toBinary({ statusMessage: "Invalid data", status: 400 }), {
            status: 400,
            headers: {
                "Content-Type": "application/x-protobuf",
            },
        });
    }
};
