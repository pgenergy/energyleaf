import { getSensorIdFromSensorToken, updateNeedsScript } from "@energyleaf/db/query";
import { energyleaf, parseReadableStream } from "@energyleaf/proto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const { ScriptAcceptedRequest, ScriptAcceptedResponse } = energyleaf;

export const POST = async (req: NextRequest) => {
    const body = req.body;
    if (!body) {
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

            return new NextResponse(ScriptAcceptedResponse.toBinary({ status: 200 }), { status: 200 });
        } catch (err) {
            // eslint-disable-next-line no-console -- we need to log the error in the production logs
            console.error(err);
            if ((err as unknown as Error).message === "token/expired") {
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

            return new NextResponse(ScriptAcceptedResponse.toBinary({ statusMessage: "Database error", status: 500 }), {
                status: 500,
                headers: {
                    "Content-Type": "application/x-protobuf",
                },
            });
        }
    } catch (err) {
        // eslint-disable-next-line no-console -- we need to log the error in the production logs
        console.error(err);
        return new NextResponse(ScriptAcceptedResponse.toBinary({ status: 400, statusMessage: "Invalid data" }), {
            status: 400,
            headers: {
                "Content-Type": "application/x-protobuf",
            },
        });
    }
};
