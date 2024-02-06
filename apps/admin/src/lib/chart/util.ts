import type { ChartConfiguration } from "chart.js/auto";
import { Chart } from "chart.js/auto";
import { JSDOM } from "jsdom";

/**
 * Renders a chart to a base64 data string
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

    const data = canvas.toDataURL("image/png");
    chart.destroy();

    return data;
}

/**
 * Encodes a chart configuration to a base64 string
 * @example
 * ```
 *   const data: ChartConfiguration = {
 *       type: "line",
 *       data: {
 *           labels: ["January", "February", "March", "April", "May", "June", "July"],
 *           datasets: [
 *               {
 *                   label: "Energy",
 *                   data: [65, 59, 80, 81, 56, 55, 40],
 *                   fill: false,
 *                   borderColor: "rgb(75, 192, 192)",
 *                   tension: 0.1,
 *               },
 *           ],
 *       },
 *       options: {
 *           scales: {
 *               x: {
 *                   grid: {
 *                       display: false,
 *                   },
 *               },
 *               y: {
 *                   grid: {
 *                       display: false,
 *                   },
 *               },
 *           },
 *           plugins: {
 *               legend: {
 *                   display: false,
 *               },
 *           },
 *       },
 *   };
 * ```
 */
export function encodeChartSearchParam(data: ChartConfiguration) {
    const buffer = Buffer.from(JSON.stringify(data));
    return buffer.toString("base64");
}

/**
 * Decodes a chart configuration from a base64 string
 *
 * @returns The chart configuration or null if the input is invalid
 */
export function decodeChartSearchParam(data: string) {
    try {
        const buffer = Buffer.from(data, "base64");
        return JSON.parse(buffer.toString("utf-8")) as ChartConfiguration;
    } catch (err) {
        return null;
    }
}
