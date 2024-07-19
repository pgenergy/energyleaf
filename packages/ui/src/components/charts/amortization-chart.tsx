"use client";

import { fulfills } from "@energyleaf/lib/versioning";
import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent } from "@energyleaf/ui/chart";
import { useMemo } from "react";
import { Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
import AmortizationChartTooltip from "./amortization-chart-tooltip";

const chartConfig = {
    before: {
        label: "Bisher",
        color: "hsl(var(--chart-5))",
    },
    after: {
        label: "Nach Anschaffung neuer Geräte",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig;

interface Props {
    weeklyCostsBefore: number;
    weeklyCostsAfter: number;
    initialCostsAfter: number;
    amortizationTimeInYears: number;
}

export function AmortizationChart(props: Props) {
    const { data, unit, amortizationDuration } = useMemo(() => generateData(props), [props]);
    const xAxisUnit = unit === "years" ? "Jahren" : "Monaten";

    return (
        <ChartContainer className="h-80 w-full" config={chartConfig}>
            <LineChart data={data}>
                <XAxis
                    dataKey="timestamp"
                    type="number"
                    tickLine={true}
                    interval="equidistantPreserveStart"
                    axisLine={true}
                    tickCount={data.length}
                    label={{ value: `Zeit in ${xAxisUnit}`, position: "insideBottom", offset: -4 }}
                />
                <YAxis
                    tickLine={true}
                    interval="equidistantPreserveStart"
                    type="number"
                    tickCount={data.length / 3}
                    label={{ value: "Kosten in €", angle: -90, position: "insideLeft", offset: 4 }}
                />
                <Line type="linear" dataKey="before" stroke="var(--color-before)" dot={false} />
                <Line type="linear" dataKey="after" stroke="var(--color-after)" dot={false} />
                <ReferenceLine x={amortizationDuration} label="Amortisation" />
                <Tooltip content={(props) => <AmortizationChartTooltip tooltipProps={props} unit={unit} />} />
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

function generateData({ weeklyCostsBefore, weeklyCostsAfter, initialCostsAfter, amortizationTimeInYears }: Props) {
    let amortizationDuration = amortizationTimeInYears;
    let unit: "years" | "months" = "years";
    let weeklyCostFactor = 52;
    if (amortizationTimeInYears <= 3) {
        amortizationDuration = amortizationTimeInYears * 12;
        unit = "months";
        weeklyCostFactor = 4.33;
    }

    const ceiledAmortizationDuration = Math.ceil(amortizationDuration);
    const numberOfDataPoints = Number.isFinite(ceiledAmortizationDuration) ? (ceiledAmortizationDuration + 1) * 1.5 : 1;

    return {
        data: Array.from({ length: numberOfDataPoints }, (_, i) => {
            const timestamp = i;
            return {
                timestamp,
                before: weeklyCostsBefore * weeklyCostFactor * timestamp,
                after: initialCostsAfter + weeklyCostsAfter * weeklyCostFactor * timestamp,
            };
        }),
        unit,
        amortizationDuration,
    };
}
