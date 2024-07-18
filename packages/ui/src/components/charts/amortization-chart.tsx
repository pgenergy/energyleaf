"use client";

import { fulfills } from "@energyleaf/lib/versioning";
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

interface Props {
    weeklyCostsBefore: number;
    weeklyCostsAfter: number;
    initialCostsAfter: number;
}

export function AmortizationChart({ weeklyCostsBefore, weeklyCostsAfter, initialCostsAfter }: Props) {
    // Generate data for the chart
    const data = Array.from({ length: 52 }, (_, i) => {
        const timestamp = i;
        return {
            timestamp,
            before: weeklyCostsBefore * timestamp,
            after: initialCostsAfter + weeklyCostsAfter * timestamp,
        };
    });

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
