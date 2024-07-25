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
import { startOfMonth } from "date-fns";
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

function getWeekOfMonth(date: Date): number {
    const dayOfMonth = date.getDate();

    const startMonth = startOfMonth(new Date());
    const startDay = startMonth.getDay();

    const weekStartAdjusted = startDay === 0 ? 7 : startDay;
    const offset = weekStartAdjusted > 1 ? 8 - weekStartAdjusted : 1;
    const weekNumber = Math.ceil((dayOfMonth + offset - 1) / 7);

    return weekNumber;
}

export default function CostWeekChart(props: Props) {
    function tickFormatter(value: Date) {
        const week = getWeekOfMonth(value);
        return `Woche ${week}`;
    }

    const fillArray = useMemo(() => {
        const result: (SensorDataSelectType & { cost: number })[] = [];
        const startMonth = startOfMonth(new Date());

        for (let i = 0; i < 4; i++) {
            const date = new Date();
            date.setDate(startMonth.getDate() + i * 7);

            result.push({
                id: i.toString(),
                sensorId: "",
                timestamp: date,
                value: 0,
                valueOut: null,
                valueCurrent: null,
                cost: 0,
            });
        }

        return result;
    }, []);

    const processedData = useMemo(() => {
        return props.data.reduce((acc, cur) => {
            const index = acc.findIndex((item) => getWeekOfMonth(item.timestamp) === getWeekOfMonth(cur.timestamp));
            if (index !== -1) {
                const existing = acc[index];
                existing.cost = cur.cost;
                existing.sensorId = cur.sensorId;
            }

            return acc;
        }, fillArray);
    }, [fillArray, props.data]);

    return (
        <ChartContainer config={chartConfig} className="max-h-96 min-h-52 w-full">
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
    );
}
