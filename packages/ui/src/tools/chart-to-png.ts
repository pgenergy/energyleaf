import type { ChartConfiguration } from "chart.js/auto";
import { Chart } from "chart.js/auto";
import { JSDOM } from "jsdom";

/**
 * Renders a chart to a base64 data string that can be used as a src for an image tag.
 */
export function renderChart(config: ChartConfiguration) {
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

    const data = chart.toBase64Image();
    chart.destroy();

    return data;
}
