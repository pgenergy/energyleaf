import type { DayStatistics } from "@energyleaf/lib";
import { renderChart } from "@energyleaf/ui/tools";

export function renderDailyConsumptionChart(dayStatistics: DayStatistics[]) {
    return renderChart(
        {
            type: "bar",
            data: {
                labels: dayStatistics.map((x) => x.day),
                datasets: [
                    {
                        label: "Täglicher Verbrauch",
                        data: dayStatistics.map((x) => x.dailyConsumption),
                        fill: false,
                        backgroundColor: "#439869",
                        tension: 0.1,
                        datalabels: {
                            color: "#FFFFFF",
                            formatter: (value) => `${value} kWh`,
                        },
                    },
                ],
            },
        },
        800,
        400,
    );
}
