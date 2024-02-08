import type { ChartConfiguration } from "chart.js/auto";
import { Chart } from "chart.js/auto";
import { JSDOM } from "jsdom";

/**
 * Renders a chart to a base64 data string that can be used as a src for an image tag.
 *
 * @param config - The chart configuration. See https://www.chartjs.org/docs/latest/configuration/
 * @param width - The width of the chart in pixels.
 * @param height - The height of the chart in pixels.
 *
 * @returns A base64 data string to include in image src tag
 * @throws If the canvas context could not be obtained from the JSDOM instance
 */
export function renderChart(config: ChartConfiguration, width: number, height: number) {
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
            <head>
            </head>
            <body>
                <canvas id="canvas" width="${width}" height="${height}"></canvas>
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
