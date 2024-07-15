"use client";

import type { SensorDataSelectType } from "@energyleaf/db/types";
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@energyleaf/ui/chart";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

interface Props {
    data: SensorDataSelectType[];
}

const chartConfig = {
    value: {
        label: "Verbrauch (kWh)",
        color: "hsl(var(--primary))",
    },
    valueOut: {
        label: "Eingespeist (kWh)",
        color: "hsl(var(--chart-4))",
    },
    valueCurrent: {
        label: "Aktuell (kWh)",
        color: "hsl(var(--chart-5))",
    },
} satisfies ChartConfig;

export default function HourChart(props: Props) {
    const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>("value");

    function tickFormatter(value: Date) {
        const hour = format(value, "HH");
        return `${hour} Uhr`;
    }

    const hasOutValues = useMemo(() => {
        return props.data.some((d) => d.valueOut);
    }, [props.data]);

    const hasCurrentValues = useMemo(() => {
        return props.data.some((d) => d.valueCurrent);
    }, [props.data]);

    const displayedItems = useMemo(() => {
        const values: string[] = ["value"];
        if (hasCurrentValues) {
            values.push("valueCurrent");
        }

        if (hasOutValues) {
            values.push("valueOut");
        }
        return values;
    }, [hasOutValues, hasCurrentValues]);

    return (
        <ChartContainer config={chartConfig} className="max-h-96 min-h-52 w-full">
            <BarChart
                data={props.data}
                accessibilityLayer
                margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 10,
                }}
            >
                <ChartLegend
                    content={
                        <ChartLegendContent
                            setActiveChart={setActiveChart}
                            displayedItems={displayedItems}
                            activeLabel={activeChart}
                        />
                    }
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <XAxis
                    dataKey="timestamp"
                    type="category"
                    tickFormatter={(value) => tickFormatter(value)}
                    tickLine={false}
                    interval="equidistantPreserveStart"
                />
                <YAxis
                    dataKey={activeChart}
                    type="number"
                    tickFormatter={(value) => value.toLocaleString()}
                    tickLine={false}
                    interval="equidistantPreserveStart"
                />
                {activeChart === "value" ? <Bar dataKey="value" fill="var(--color-value)" radius={4} /> : null}
            </BarChart>
        </ChartContainer>
    );
}
