import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSensorIdFromSensorToken, updateNeedsScript } from "@energyleaf/db/query";
import { ScriptAcceptedRequest, ScriptAcceptedResponse } from "@energyleaf/proto";
import { parseReadableStream } from "@energyleaf/proto/util";

export const POST = async (req: NextRequest) => {
    const body = req.body;
    if (!body) {
        return new NextResponse(ScriptAcceptedResponse.toBinary({ status: 400, statusMessage: "No body" }), {
            status: 400,
        });
    }

    try {
        const binaryData = await parseReadableStream(body);
        const data = ScriptAcceptedRequest.fromBinary(binaryData);

        try {
            const sensorId = await getSensorIdFromSensorToken(data.accessToken);

            await updateNeedsScript(sensorId, false);

            return new NextResponse(ScriptAcceptedResponse.toBinary({ status: 204 }), { status: 204 });
        } catch (err) {
            if ((err as unknown as Error).message === "token/expired") {
                return new NextResponse(
                    ScriptAcceptedResponse.toBinary({ statusMessage: "Token expired", status: 401 }),
                    {
                        status: 401,
                    },
                );
            }

            if ((err as unknown as Error).message === "token/invalid") {
                return new NextResponse(
                    ScriptAcceptedResponse.toBinary({ statusMessage: "Token invalid", status: 401 }),
                    {
                        status: 401,
                    },
                );
            }

            if ((err as unknown as Error).message === "token/notfound") {
                return new NextResponse(
                    ScriptAcceptedResponse.toBinary({ statusMessage: "Token not found", status: 404 }),
                    {
                        status: 404,
                    },
                );
            }

            if ((err as unknown as Error).message === "sensor/notfound") {
                return new NextResponse(
                    ScriptAcceptedResponse.toBinary({ statusMessage: "Sensor not found", status: 404 }),
                    {
                        status: 404,
                    },
                );
            }

            return new NextResponse(ScriptAcceptedResponse.toBinary({ statusMessage: "Database error", status: 500 }), {
                status: 500,
            });
        }
    } catch (err) {
        return new NextResponse(ScriptAcceptedResponse.toBinary({ status: 400, statusMessage: "Invalid data" }), {
            status: 400,
        });
    }
};
