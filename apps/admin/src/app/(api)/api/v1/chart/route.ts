import { NextResponse, type NextRequest } from "next/server";
import { renderChart } from "@/lib/chart/util";
import type { ChartConfiguration } from "chart.js";

// eslint-disable-next-line @typescript-eslint/require-await -- required for Next.js API routes even if not async
export async function GET(req: NextRequest) {
    const dataBuffer = req.nextUrl.searchParams.get("data");
    if (!dataBuffer) {
        return new NextResponse("Invalid input", { status: 400 });
    }
    const bufferData = Buffer.from(dataBuffer, "base64").toString("utf-8");
    const data = JSON.parse(bufferData) as ChartConfiguration;

    try {
        const image = renderChart(data).replace("data:image/png;base64,", "");
        const buffer = Buffer.from(image, "base64");
        const res = new NextResponse(buffer, {
            status: 200,
            headers: { "Content-Type": "image/png", "Content-Length": buffer.length.toString() },
        });
        return res;
    } catch (err) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
