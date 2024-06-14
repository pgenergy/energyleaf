import { createSensorToken, getSensorDataByClientId } from "@energyleaf/db/query";
import { energyleaf, parseReadableStream } from "@energyleaf/proto";
import { type NextRequest, NextResponse } from "next/server";
const { TokenRequest, TokenResponse } = energyleaf;

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

        console.info(data);

        try {
            const code = await createSensorToken(data.clientId);
            const sensorData = await getSensorDataByClientId(data.clientId);
            if (!sensorData) {
                return new NextResponse(TokenResponse.toBinary({ statusMessage: "Sensor not found", status: 404 }), {
                    status: 404,
                    headers: {
                        "Content-Type": "application/x-protobuf",
                    },
                });
            }

            if ((sensorData.needsScript || data.needScript) && sensorData.script) {
                return new NextResponse(
                    TokenResponse.toBinary({
                        status: 200,
                        accessToken: code,
                        expiresIn: 3600,
                        script: sensorData.script,
                    }),
                    {
                        status: 200,
                        headers: {
                            "Content-Type": "application/x-protobuf",
                        },
                    },
                );
            }

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
            console.error(err, data);

            if (
                (err as unknown as Error).message === "sensor/not-found" ||
                (err as unknown as Error).message === "sensor/no-user"
            ) {
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
        // eslint-disable-next-line no-console -- we need to log the error in the production logs
        console.error(e);
        return new NextResponse(TokenResponse.toBinary({ statusMessage: "Invalid data", status: 400 }), {
            status: 400,
            headers: {
                "Content-Type": "application/x-protobuf",
            },
        });
    }
};
