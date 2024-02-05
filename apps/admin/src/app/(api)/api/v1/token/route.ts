import { NextResponse, type NextRequest } from "next/server";

import { createSensorToken } from "@energyleaf/db/query";
import { TokenRequest, TokenResponse } from "@energyleaf/proto/auth";
import { ErrorResponse } from "@energyleaf/proto/errors";
import { parseReadableStream } from "@energyleaf/proto/util";

export const POST = async (req: NextRequest) => {
    const body = req.body;
    if (!body) {
        return new NextResponse(ErrorResponse.toBinary({ msg: "Invalid body", status: 400 }), { status: 400 });
    }
    const binaryData = await parseReadableStream(body);
    try {
        const data = TokenRequest.fromBinary(binaryData);
        try {
            const code = await createSensorToken(data.clientId);
            return new NextResponse(TokenResponse.toBinary({ accessToken: code, expiresIn: 3600 }), {
                status: 200,
            });
        } catch (err) {
            if ((err as unknown as Error).message === "sensor/not-found") {
                return new NextResponse(ErrorResponse.toBinary({ msg: "Sensor not found", status: 404 }), {
                    status: 404,
                });
            }

            return new NextResponse(ErrorResponse.toBinary({ msg: "Database error", status: 500 }), { status: 500 });
        }
    } catch (e) {
        return new NextResponse(ErrorResponse.toBinary({ msg: "Invalid data", status: 400 }), { status: 400 });
    }
};
