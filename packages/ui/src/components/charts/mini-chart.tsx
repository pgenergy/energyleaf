"use client";

import type { SensorDataSelectType } from "@energyleaf/db/types";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer } from "../../ui/chart";

interface Props {
    data: SensorDataSelectType[];
    display: "value" | "valueOut" | "valueCurrent";
}

const chartConfig = {
    value: {
        color: "hsl(var(--primary))",
    },
    valueOut: {
        color: "hsl(var(--chart-3))",
    },
    valueCurrent: {
        color: "hsl(var(--chart-4))",
    },
} satisfies ChartConfig;

export default function MiniChart(props: Props) {
    return (
        <ChartContainer className="max-h-8 min-h-8 w-full" config={chartConfig}>
            <AreaChart data={props.data}>
                <defs>
                    <linearGradient id="valueColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.99} />
                        <stop offset="50%" stopColor="var(--color-value)" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="valueOutColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-valueOut)" stopOpacity={0.99} />
                        <stop offset="50%" stopColor="var(--color-valueOut)" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="var(--color-valueOut)" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="valueCurrentColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-valueCurrent)" stopOpacity={0.99} />
                        <stop offset="50%" stopColor="var(--color-valueCurrent)" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="var(--color-valueCurrent)" stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <XAxis dataKey="timestamp" tickLine={false} tick={false} hide axisLine={false} />
                <YAxis dataKey={props.display} tickLine={false} tick={false} hide axisLine={false} />
                {props.display === "value" ? (
                    <Area
                        dataKey="value"
                        connectNulls
                        fill="url(#valueColor)"
                        fillOpacity={1}
                        stroke="var(--color-value)"
                        type="linear"
                    />
                ) : null}
                {props.display === "valueOut" ? (
                    <Area
                        dataKey="valueOut"
                        connectNulls
                        fill="url(#valueOutColor)"
                        fillOpacity={1}
                        stroke="var(--color-valueOut)"
                        type="linear"
                    />
                ) : null}
                {props.display === "valueCurrent" ? (
                    <Area
                        dataKey="valueCurrent"
                        connectNulls
                        fill="url(#valueCurrentColor)"
                        fillOpacity={1}
                        stroke="var(--color-valueCurrent)"
                        type="linear"
                    />
                ) : null}
            </AreaChart>
        </ChartContainer>
    );
}
