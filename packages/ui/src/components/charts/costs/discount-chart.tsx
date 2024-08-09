"use client";

import type { SensorDataSelectType } from "@energyleaf/db/types";
import { eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";
import { de } from "date-fns/locale";
import { useMemo } from "react";
import { Line, LineChart, XAxis, YAxis } from "recharts";
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "../../../ui/chart";

interface Props {
    data: (SensorDataSelectType & { cost: number })[];
    dailyCost: number;
}

const chartConfig = {
    dailyCost: {
        label: "Abschlagskosten (€)",
        color: "hsl(var(--primary))",
    },
    cost: {
        label: "Kosten (€)",
        color: "hsl(var(--chart-5))",
    },
} satisfies ChartConfig;

export default function CostDiscountChart(props: Props) {
    function tickFormatter(value: Date) {
        const day = format(value, "do", { locale: de });
        return day;
    }

    const fillArray = useMemo(() => {
        const startDate = startOfMonth(new Date());
        const endDate = endOfMonth(new Date());
        const result: (SensorDataSelectType & { cost: number | null; dailyCost: number })[] = [];

        eachDayOfInterval({ start: startDate, end: endDate }).map((date) => {
            result.push({
                id: "",
                sensorId: "",
                timestamp: date,
                value: 0,
                valueOut: null,
                valueCurrent: null,
                cost: null,
                dailyCost: props.dailyCost * date.getDate(),
            });
        });

        return result;
    }, [props.dailyCost]);

    const processedData = useMemo(() => {
        return props.data.reduce((acc, cur) => {
            const index = acc.findIndex((item) => item.timestamp.getDate() === cur.timestamp.getDate());
            if (index !== -1) {
                const existing = acc[index];
                existing.cost = cur.cost;
                existing.sensorId = cur.sensorId;
                existing.id = cur.id;
            }

            return acc;
        }, fillArray);
    }, [fillArray, props.data]);

    const maxKey = useMemo(() => {
        const endDate = endOfMonth(new Date());
        const dailyMax = props.dailyCost * endDate.getDate();
        const maxData = props.data[props.data.length - 1].cost;

        if (maxData > dailyMax) {
            return "cost";
        }

        return "dailyCost";
    }, [props.dailyCost, props.data]);

    return (
        <ChartContainer config={chartConfig} className="max-h-[40rem] min-h-96 w-full">
            <LineChart
                data={processedData}
                accessibilityLayer
                margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 10,
                }}
            >
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <XAxis
                    dataKey="timestamp"
                    type="category"
                    tickFormatter={(value) => tickFormatter(value)}
                    tickLine={false}
                    interval="equidistantPreserveStart"
                />
                <YAxis
                    dataKey={maxKey}
                    type="number"
                    tickFormatter={(value) => value.toLocaleString()}
                    tickLine={false}
                    interval="equidistantPreserveStart"
                />
                <Line
                    dataKey="cost"
                    type="linear"
                    dot={false}
                    stroke="var(--color-cost)"
                    strokeWidth={3}
                    strokeDasharray="4 4"
                />
                <Line dataKey="dailyCost" type="linear" dot={false} stroke="var(--color-dailyCost)" strokeWidth={2} />
            </LineChart>
        </ChartContainer>
    );
}
