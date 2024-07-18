"use client";

import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent } from "@energyleaf/ui/chart";
import { Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import AmortizationChartTooltip from "./amortization-chart-tooltip";

const chartConfig = {
    before: {
        label: "Bisher",
        color: "hsl(var(--primary))",
    },
    after: {
        label: "Nach Anschaffung neuer Geräte",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig;

export function AmortizationChart() {
    const data = [
        {
            before: 0,
            after: 150,
            timestamp: 0,
        },
        {
            before: 100,
            after: 165,
            timestamp: 1,
        },
        {
            before: 200,
            after: 180,
            timestamp: 2,
        },
    ];

    return (
        <ChartContainer className="min-h-52 w-full" config={chartConfig}>
            <LineChart data={data}>
                <XAxis
                    dataKey="timestamp"
                    type="category"
                    tickLine={false}
                    interval="equidistantPreserveStart"
                    axisLine={false}
                    label="Zeit in Wochen"
                />
                <YAxis tickLine={false} interval="equidistantPreserveStart" type="number" />
                <Line type="monotone" dataKey="before" stroke="var(--color-before)" />
                <Line type="monotone" dataKey="after" stroke="var(--color-after)" />
                <Tooltip content={(props) => <AmortizationChartTooltip tooltipProps={props} />} />
                <ChartLegend
                    content={
                        <ChartLegendContent
                            setActiveChart={() => {}}
                            displayedItems={["after", "before"]}
                            activeLabel={undefined}
                        />
                    }
                />
            </LineChart>
        </ChartContainer>
    );
}
