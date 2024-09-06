"use client";

import type { SensorDataSelectType } from "@energyleaf/postgres/types";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer } from "../../../ui/chart";

interface Props {
    data: SensorDataSelectType[];
    display: "consumption" | "inserted" | "valueCurrent";
}

const chartConfig = {
    consumption: {
        color: "hsl(var(--primary))",
    },
    inserted: {
        color: "hsl(var(--chart-3))",
    },
    valueCurrent: {
        color: "hsl(var(--chart-4))",
    },
} satisfies ChartConfig;

export default function EnergyMiniChart(props: Props) {
    return (
        <ChartContainer className="h-8 max-h-8 min-h-8 w-full" config={chartConfig}>
            <AreaChart data={props.data}>
                <defs>
                    <linearGradient id="consumptionColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-consumption)" stopOpacity={0.99} />
                        <stop offset="50%" stopColor="var(--color-consumption)" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="var(--color-consumption)" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="insertedColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-inserted)" stopOpacity={0.99} />
                        <stop offset="50%" stopColor="var(--color-inserted)" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="var(--color-inserted)" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="valueCurrentColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-valueCurrent)" stopOpacity={0.99} />
                        <stop offset="50%" stopColor="var(--color-valueCurrent)" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="var(--color-valueCurrent)" stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <XAxis dataKey="timestamp" tickLine={false} tick={false} hide axisLine={false} />
                <YAxis dataKey={props.display} tickLine={false} tick={false} hide axisLine={false} />
                {props.display === "consumption" ? (
                    <Area
                        dataKey="consumption"
                        connectNulls
                        fill="url(#consumptionColor)"
                        fillOpacity={1}
                        stroke="var(--color-consumption)"
                        type="linear"
                    />
                ) : null}
                {props.display === "inserted" ? (
                    <Area
                        dataKey="inserted"
                        connectNulls
                        fill="url(#insertedColor)"
                        fillOpacity={1}
                        stroke="var(--color-inserted)"
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
