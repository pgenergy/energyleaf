import { NextResponse, type NextRequest } from "next/server";
import { ELData } from "@/lib/proto/sensor-data";

/**
 * Parse the binary data from the request body
 * This is needed because the body is a ReadableStream and the the prot needs a Uint8Array
 */
const parseData = async (data: ReadableStream<Uint8Array>) => {
    async function readStream(stream: ReadableStreamDefaultReader<Uint8Array>, result: Uint8Array) {
        const { value, done } = await stream.read();
        if (done) {
            return result;
        }

        const tmp = new Uint8Array(result.length + value.length);
        tmp.set(result);
        tmp.set(value, result.length);
        return readStream(stream, tmp);
    }

    const result = new Uint8Array(0);
    const reader = data.getReader();

    return readStream(reader, result);
};

export const POST = async (req: NextRequest) => {
    const body = req.body;
    if (!body) {
        return NextResponse.json(
            {
                status: "error",
                message: "No body",
            },
            {
                status: 400,
            },
        );
    }
    const binaryData = await parseData(body);
    try {
        const data = ELData.fromBinary(binaryData);

        return NextResponse.json({
            status: "ok",
            data: JSON.stringify(data),
        });
    } catch (e) {
        return NextResponse.json(
            {
                status: "error",
                error: "Invalid data",
            },
            {
                status: 400,
            },
        );
    }
};
