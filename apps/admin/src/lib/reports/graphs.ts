import { type DailyConsumption, type DailyGoalProgress, formatDate, formatNumber } from "@energyleaf/lib";
import { renderChart } from "@energyleaf/lib/utils/chart-to-png";
import type { ChartConfiguration, ChartOptions } from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";

const primaryColor = "#439869";
const onPrimaryColor = "#FFFFFF";

export function renderDailyConsumptionChart(dayStatistics: DailyConsumption[]) {
    return renderChart(
        {
            type: "bar",
            data: {
                labels: dayStatistics.map((x) => formatDate(x.day)),
                datasets: [
                    {
                        label: "Täglicher Verbrauch in kWh",
                        data: dayStatistics.map((x) => x.consumption),
                        fill: false,
                        backgroundColor: primaryColor,
                        tension: 0.1,
                        datalabels: {
                            color: onPrimaryColor,
                            formatter: (value) => formatNumber(value),
                        },
                    },
                ],
            },
            plugins: [ChartDataLabels],
        },
        600,
        300,
    );
}

export function renderDailyStatistic({ progress, exceeded }: DailyGoalProgress) {
    const prog = progress ?? 0;
    const remaining = prog < 100 ? 100 - prog : 0;

    const barColor = exceeded ? "#EF4444" : primaryColor;

    const cutout = 80;

    const chartOptions: ChartOptions<"doughnut"> = {
        responsive: true,
        cutout: `${cutout}%`,
        circumference: 360,
        plugins: {
            tooltip: { enabled: false },
            legend: { display: false },
        },
    };

    const chartConfiguration: ChartConfiguration<"doughnut"> = {
        type: "doughnut",
        data: {
            datasets: [
                {
                    data: [prog, remaining],
                    backgroundColor: [barColor, onPrimaryColor],
                    borderWidth: 0,
                },
            ],
        },
        options: chartOptions,
        plugins: [
            {
                id: "whiteCenter",
                beforeDatasetDraw(chart) {
                    const { ctx } = chart;
                    ctx.save();

                    const xCenter = chart.getDatasetMeta(0).data[0].x;
                    const yCenter = chart.getDatasetMeta(0).data[0].y;

                    const startAngle = 0;
                    const endAngle = 2 * Math.PI;
                    const radius = 0.6 * cutout; // a bit more than half to prevent a small gap

                    ctx.beginPath();
                    ctx.arc(xCenter, yCenter, radius, startAngle, endAngle);
                    ctx.fillStyle = "#f4f4f5";
                    ctx.fill();

                    ctx.restore();
                },
                afterDatasetsDraw(chart) {
                    const { ctx, data } = chart;
                    ctx.save();

                    const xCenter = chart.getDatasetMeta(0).data[0].x;
                    const yCenter = chart.getDatasetMeta(0).data[0].y;

                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.font = "24px Arial";
                    ctx.fillStyle = "#000";

                    // Get the percentage from the data
                    const percentage = Math.round(data.datasets[0].data[0] as number);

                    // Draw the percentage text
                    ctx.fillText(`${percentage}%`, xCenter, yCenter);

                    ctx.restore();
                },
            },
        ],
    };

    return renderChart(chartConfiguration as ChartConfiguration, 100, 100);
}
