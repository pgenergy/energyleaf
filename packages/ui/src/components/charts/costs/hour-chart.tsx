"use client";

import type { SensorDataSelectType } from "@energyleaf/postgres/types";
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@energyleaf/ui/chart";
import { format } from "date-fns";
import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

interface Props {
    data: (SensorDataSelectType & { cost: number })[];
}

const chartConfig = {
    cost: {
        label: "Kosten (€)",
        color: "hsl(var(--chart-5))",
    },
} satisfies ChartConfig;

export default function CostHourChart(props: Props) {
    function tickFormatter(value: Date) {
        const hour = format(value, "HH");
        return `${hour} Uhr`;
    }

    const fillArray = useMemo(() => {
        const result: (SensorDataSelectType & { cost: number })[] = [];

        for (let i = 0; i < 24; i++) {
            const date = new Date();
            date.setHours(i, 0, 0, 0);

            result.push({
                id: i.toString(),
                sensorId: "",
                timestamp: date,
                value: 0,
                consumption: 0,
                valueOut: null,
                inserted: null,
                valueCurrent: null,
                cost: 0,
            });
        }

        return result;
    }, []);

    const processedData = useMemo(() => {
        return props.data.reduce((acc, cur) => {
            const index = acc.findIndex((item) => item.timestamp.getHours() === cur.timestamp.getHours());
            if (index !== -1) {
                const existing = acc[index];
                existing.cost = cur.cost;
                existing.sensorId = cur.sensorId;
            }

            return acc;
        }, fillArray);
    }, [fillArray, props.data]);

    return (
        <>
            <ChartContainer config={chartConfig} className="h-52 min-h-52 w-full md:h-96">
                <BarChart
                    data={processedData}
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
                        dataKey="cost"
                        type="number"
                        tickFormatter={(value) => value.toLocaleString()}
                        tickLine={false}
                        interval="equidistantPreserveStart"
                    />
                    <Bar dataKey="cost" fill="var(--color-cost)" radius={4} />
                </BarChart>
            </ChartContainer>
        </>
    );
}
