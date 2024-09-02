import { insertSensorData } from "@energyleaf/postgres/query/energy-insert";
import { log, logError } from "@energyleaf/postgres/query/logs";
import { getSensorIdFromSensorToken } from "@energyleaf/postgres/query/token";
import { energyleaf, parseReadableStream } from "@energyleaf/proto";
import { waitUntil } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";

const { SensorDataRequestV2, SensorDataRequest, SensorDataResponse, SensorType } = energyleaf;

export const POST = async (req: NextRequest) => {
    const body = req.body;
    if (!body) {
        waitUntil(log("request-unauthorized/missing-body", "error", "sensor-input", "api", req));
        return new NextResponse(SensorDataResponse.toBinary({ status: 400, statusMessage: "No body" }), {
            status: 400,
            headers: {
                "Content-Type": "application/x-protobuf",
            },
        });
    }
    try {
        const binaryData = await parseReadableStream(body);
        let data: {
            type: number;
            accessToken: string;
            value: number;
            valueOut?: number;
            valueCurrent?: number;
            timestamp?: bigint;
        };
        try {
            data = SensorDataRequestV2.fromBinary(binaryData);
        } catch (err) {
            try {
                const parsedData = SensorDataRequest.fromBinary(binaryData);
                data = {
                    ...parsedData,
                    valueOut: undefined,
                    valueCurrent: undefined,
                    timestamp: undefined,
                };
            } catch (err) {
                waitUntil(logError("sensor-input/invalid-data", "sensor-input", "api", req, err));
                return new NextResponse(SensorDataResponse.toBinary({ status: 400, statusMessage: "Invalid data" }), {
                    status: 400,
                    headers: {
                        "Content-Type": "application/x-protobuf",
                    },
                });
            }
        }

        console.info(data);

        if (data.value <= 0) {
            waitUntil(log("sensor/value-zero", "error", "sensor-input", "api", { req, data }));
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

        if (data.timestamp && (data.timestamp > Number.MAX_SAFE_INTEGER || data.timestamp < 0)) {
            waitUntil(log("sensor/timestamp-out-of-range", "error", "sensor-input", "api", { req, data }));
            return new NextResponse(
                SensorDataResponse.toBinary({ status: 400, statusMessage: "Timestamp out of range" }),
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
            const inputData = {
                sensorId,
                value: data.value,
                valueOut: data.valueOut,
                valueCurrent: data.valueCurrent,
                sum: needsSum,
                timestamp: data.timestamp ? new Date(Number(data.timestamp)) : new Date(),
            };

            try {
                await insertSensorData(inputData);
            } catch (e) {
                if ((e as unknown as Error).message === "value/too-high") {
                    waitUntil(
                        logError(
                            "sensor-input/insert-failed/value/too-high",
                            "sensor-input",
                            "api",
                            { inputData, data },
                            e,
                        ),
                    );
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
            if ((e as unknown as Error).message === "token/expired") {
                waitUntil(logError("sensor-input/token-expired", "sensor-input", "api", data, e));
                return new NextResponse(SensorDataResponse.toBinary({ statusMessage: "Token expired", status: 401 }), {
                    status: 401,
                    headers: {
                        "Content-Type": "application/x-protobuf",
                    },
                });
            }

            if ((e as unknown as Error).message === "token/invalid") {
                waitUntil(logError("sensor-input/token-invalid", "sensor-input", "api", data, e));
                return new NextResponse(SensorDataResponse.toBinary({ statusMessage: "Token invalid", status: 401 }), {
                    status: 401,
                    headers: {
                        "Content-Type": "application/x-protobuf",
                    },
                });
            }

            if ((e as unknown as Error).message === "token/not-found") {
                waitUntil(logError("sensor-input/token-not-found", "sensor-input", "api", data, e));
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
                waitUntil(logError("sensor-input/sensor-not-found", "sensor-input", "api", data, e));
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

            waitUntil(logError("sensor-input/database-error", "sensor-input", "api", req, e));
            return new NextResponse(SensorDataResponse.toBinary({ statusMessage: "Database error", status: 500 }), {
                status: 500,
                headers: {
                    "Content-Type": "application/x-protobuf",
                },
            });
        }
    } catch (err) {
        waitUntil(logError("sensor-input/invalid-data", "sensor-input", "api", req, err));
        return new NextResponse(SensorDataResponse.toBinary({ status: 400, statusMessage: "Invalid data" }), {
            status: 400,
            headers: {
                "Content-Type": "application/x-protobuf",
            },
        });
    }
};
