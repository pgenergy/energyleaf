"use client";
import type { DailyGoalStatistic } from "@energyleaf/lib";
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@energyleaf/ui/chart";
import {} from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

interface Props {
    data: DailyGoalStatistic[];
}

const chartConfig = {
    dailyConsumption: {
        label: "Verbrauch (kWh)",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig;

export default function ReportDailyEnergyConsumptionChart({ data }: Props) {
    function tickFormatter(value: Date) {
        return value.toLocaleDateString();
    }

    return (
        <ChartContainer config={chartConfig} className="max-h-96 min-h-52 w-full">
            <BarChart
                data={data}
                accessibilityLayer
                margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 10,
                }}
            >
                <ChartLegend content={<ChartLegendContent />} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <XAxis
                    dataKey="day"
                    type="category"
                    tickFormatter={(value) => tickFormatter(value)}
                    tickLine={false}
                    interval="equidistantPreserveStart"
                />
                <YAxis dataKey="dailyConsumption" type="number" tickLine={false} interval="equidistantPreserveStart" />
                <Bar dataKey="dailyConsumption" fill="var(--color-dailyConsumption)" radius={4} />
            </BarChart>
        </ChartContainer>
    );
}
