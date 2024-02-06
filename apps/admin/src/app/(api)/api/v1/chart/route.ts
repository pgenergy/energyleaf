import { NextResponse, type NextRequest } from "next/server";
import type { ChartConfiguration } from "chart.js";
import { Chart } from "chart.js/auto";
import { JSDOM } from "jsdom";

function renderChart(config: ChartConfiguration) {
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
            <head>
            </head>
            <body>
                <canvas id="canvas" width="720" height="480"></canvas>
            </body>
        </html>
    `);

    const canvas = dom.window.document.getElementById("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Could not get canvas context");
    }

    const chart = new Chart(ctx, {
        ...config,
        options: {
            ...config.options,
            animation: false,
            responsive: false,
        },
    });

    const data = canvas.toDataURL("image/png");
    chart.destroy();

    return data;
}

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
