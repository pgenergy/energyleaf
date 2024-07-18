"use client";

import type { SensorDataSelectType } from "@energyleaf/db/types";
import { Button } from "@energyleaf/ui/button";
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@energyleaf/ui/chart";
import { format } from "date-fns";
import { de } from "date-fns/locale";
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
        const day = format(value, "EEEE", { locale: de });
        return `${day}`;
    }

    const hasOutValues = useMemo(() => {
        return props.data.some((d) => d.valueOut);
    }, [props.data]);

    const hasCurrentValues = useMemo(() => {
        return props.data.some((d) => d.valueCurrent);
    }, [props.data]);

    return (
        <>
            {hasOutValues || hasCurrentValues ? (
                <div className="flex flex-row items-center justify-end gap-2">
                    <Button
                        variant={activeChart === "value" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveChart("value")}
                    >
                        Verbrauch
                    </Button>
                    {hasOutValues ? (
                        <Button
                            variant={activeChart === "valueOut" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setActiveChart("valueOut")}
                        >
                            Einspeisung
                        </Button>
                    ) : null}
                    {hasCurrentValues ? (
                        <Button
                            variant={activeChart === "valueCurrent" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setActiveChart("valueCurrent")}
                        >
                            Leistung
                        </Button>
                    ) : null}
                </div>
            ) : null}
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
                    <ChartLegend content={<ChartLegendContent />} />
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
        </>
    );
}
