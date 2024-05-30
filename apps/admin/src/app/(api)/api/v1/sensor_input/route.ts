import { getSensorIdFromSensorToken, insertSensorData } from "@energyleaf/db/query";
import { SensorDataRequest, SensorDataResponse, SensorType } from "@energyleaf/proto";
import { parseReadableStream } from "@energyleaf/proto/util";
import { type NextRequest, NextResponse } from "next/server";

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

        console.info(data);

        if (data.value <= 0) {
            return new NextResponse(
                SensorDataResponse.toBinary({ status: 400, statusMessage: "Value is equal to or less than zero" }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/x-protobuf",
                    },
                },
            );
        }

        try {
            const sensorId = await getSensorIdFromSensorToken(data.accessToken);
            const needsSum = data.type === SensorType.ANALOG_ELECTRICITY;

            try {
                await insertSensorData({ sensorId, value: data.value, sum: needsSum });
            } catch (e) {
                console.error(e, data);
                if ((e as unknown as Error).message === "value/too-high") {
                    return new NextResponse(
                        SensorDataResponse.toBinary({ statusMessage: "Value too high", status: 400 }),
                        {
                            status: 400,
                            headers: {
                                "Content-Type": "application/x-protobuf",
                            },
                        },
                    );
                }
            }

            return new NextResponse(SensorDataResponse.toBinary({ status: 200 }), {
                status: 200,
                headers: {
                    "Content-Type": "application/x-protobuf",
                },
            });
        } catch (e) {
            console.error(e, data);
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
                    SensorDataResponse.toBinary({ statusMessage: "Token not found", status: 401 }),
                    {
                        status: 401,
                        headers: {
                            "Content-Type": "application/x-protobuf",
                        },
                    },
                );
            }

            if (
                (e as unknown as Error).message === "sensor/not-found" ||
                (e as unknown as Error).message === "sensor/no-user"
            ) {
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

            if ((e as unknown as Error).message === "sensor/no-user") {
                return new NextResponse(
                    // we purposefully return a 404 with sensor not found, because it imetates the same behavior
                    // as if the sensor was not found on the sensor
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
        console.error(err);
        return new NextResponse(SensorDataResponse.toBinary({ status: 400, statusMessage: "Invalid data" }), {
            status: 400,
            headers: {
                "Content-Type": "application/x-protobuf",
            },
        });
    }
};
