import { NextResponse, type NextRequest } from "next/server";

import { getSensorIdFromSensorToken, insertSensorData } from "@energyleaf/db/query";
import { SensorDataRequest, SensorDataResponse, SensorType } from "@energyleaf/proto";
import { parseReadableStream } from "@energyleaf/proto/util";

export const POST = async (req: NextRequest) => {
    const body = req.body;
    if (!body) {
        return new NextResponse(SensorDataResponse.toBinary({ status: 400, statusMessage: "No body" }), {
            status: 400,
            headers: {
                "Content-Type": "application/x-protobuf",
            },
        });
    }
    try {
        const binaryData = await parseReadableStream(body);
        const data = SensorDataRequest.fromBinary(binaryData);

        if (data.value < 0) {
            return new NextResponse(SensorDataResponse.toBinary({ status: 200 }), {
                status: 200,
                headers: {
                    "Content-Type": "application/x-protobuf",
                },
            });
        }

        try {
            const sensorId = await getSensorIdFromSensorToken(data.accessToken);
            const needsSum = data.type === SensorType.ANALOG_ELECTRICITY;

            await insertSensorData({ sensorId, value: data.value, sum: needsSum });

            return new NextResponse(SensorDataResponse.toBinary({ status: 200 }), {
                status: 200,
                headers: {
                    "Content-Type": "application/x-protobuf",
                },
            });
        } catch (e) {
            // eslint-disable-next-line no-console -- we need to log the error in the production logs
            console.error(e);
            if ((e as unknown as Error).message === "token/expired") {
                return new NextResponse(SensorDataResponse.toBinary({ statusMessage: "Token expired", status: 401 }), {
                    status: 401,
                    headers: {
                        "Content-Type": "application/x-protobuf",
                    },
                });
            }

            if ((e as unknown as Error).message === "token/invalid") {
                return new NextResponse(SensorDataResponse.toBinary({ statusMessage: "Token invalid", status: 401 }), {
                    status: 401,
                    headers: {
                        "Content-Type": "application/x-protobuf",
                    },
                });
            }

            if ((e as unknown as Error).message === "token/not-found") {
                return new NextResponse(
                    SensorDataResponse.toBinary({ statusMessage: "Token not found", status: 404 }),
                    {
                        status: 404,
                        headers: {
                            "Content-Type": "application/x-protobuf",
                        },
                    },
                );
            }

            if ((e as unknown as Error).message === "sensor/not-found") {
                return new NextResponse(
                    SensorDataResponse.toBinary({ statusMessage: "Sensor not found", status: 404 }),
                    {
                        status: 404,
                        headers: {
                            "Content-Type": "application/x-protobuf",
                        },
                    },
                );
            }

            return new NextResponse(SensorDataResponse.toBinary({ statusMessage: "Database error", status: 500 }), {
                status: 500,
                headers: {
                    "Content-Type": "application/x-protobuf",
                },
            });
        }
    } catch (err) {
        // eslint-disable-next-line no-console -- we need to log the error in the production logs
        console.error(err);
        return new NextResponse(SensorDataResponse.toBinary({ status: 400, statusMessage: "Invalid data" }), {
            status: 400,
            headers: {
                "Content-Type": "application/x-protobuf",
            },
        });
    }
};
