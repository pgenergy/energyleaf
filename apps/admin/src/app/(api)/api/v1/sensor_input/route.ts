import { NextResponse, type NextRequest } from "next/server";

import { getSensorIdFromSensorToken, insertSensorData } from "@energyleaf/db/query";
import { ErrorResponse } from "@energyleaf/proto/errors";
import { ELData } from "@energyleaf/proto/sensor-data";
import { parseReadableStream } from "@energyleaf/proto/util";

export const POST = async (req: NextRequest) => {
    const body = req.body;
    if (!body) {
        return new NextResponse(ErrorResponse.toBinary({ msg: "Invalid body", status: 400 }), { status: 400 });
    }
    const binaryData = await parseReadableStream(body);
    try {
        const data = ELData.fromBinary(binaryData);
        const code = data.sensorId;

        try {
            try {
                const sensorId = await getSensorIdFromSensorToken(code);
                await insertSensorData({
                    sensorId,
                    value: data.sensorValue,
                });
            } catch (e) {
                if ((e as unknown as Error).message === "token/expired") {
                    return new NextResponse(ErrorResponse.toBinary({ msg: "Token expired", status: 401 }), {
                        status: 401,
                    });
                }

                if ((e as unknown as Error).message === "token/invalid") {
                    return new NextResponse(ErrorResponse.toBinary({ msg: "Token invalid", status: 401 }), {
                        status: 401,
                    });
                }

                if ((e as unknown as Error).message === "token/not-found") {
                    return new NextResponse(ErrorResponse.toBinary({ msg: "Token not found", status: 404 }), {
                        status: 404,
                    });
                }

                if ((e as unknown as Error).message === "sensor/not-found") {
                    return new NextResponse(ErrorResponse.toBinary({ msg: "Sensor not found", status: 404 }), {
                        status: 404,
                    });
                }

                return new NextResponse(ErrorResponse.toBinary({ msg: "Database error", status: 500 }), {
                    status: 500,
                });
            }
        } catch (err) {
            return new NextResponse(ErrorResponse.toBinary({ msg: "Unauthorized", status: 401 }), { status: 401 });
        }
    } catch (e) {
        return new NextResponse(ErrorResponse.toBinary({ msg: "Invalid data", status: 400 }), { status: 400 });
    }
};
