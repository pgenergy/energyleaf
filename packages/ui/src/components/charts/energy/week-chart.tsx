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
import ChartSwitchButton from "@energyleaf/ui/charts/chart-switch-button";
import { getWeekOfMonth, startOfMonth } from "date-fns";
import { CircleSlash2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

interface Props {
    data: SensorDataSelectType[];
}

const chartConfig = {
    consumption: {
        label: "Verbrauch (kWh)",
        color: "hsl(var(--primary))",
    },
    inserted: {
        label: "Eingespeist (kWh)",
        color: "hsl(var(--chart-3))",
    },
    valueCurrent: {
        label: "Leistung (W)",
        color: "hsl(var(--chart-4))",
    },
} satisfies ChartConfig;

export default function EnergyWeekChart(props: Props) {
    const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>("consumption");

    function tickFormatter(value: Date) {
        const week = getWeekOfMonth(value);
        return `Woche ${week}`;
    }

    const hasOutValues = useMemo(() => {
        return props.data.some((d) => d.valueOut);
    }, [props.data]);

    const hasCurrentValues = useMemo(() => {
        return props.data.some((d) => d.valueCurrent);
    }, [props.data]);

    const fillArray = useMemo(() => {
        const result: SensorDataSelectType[] = [];
        const startMonth = startOfMonth(new Date());

        for (let i = 0; i < 4; i++) {
            const date = new Date();
            date.setDate(startMonth.getDate() + i * 7);

            result.push({
                id: i.toString(),
                sensorId: "",
                timestamp: date,
                value: 0,
                consumption: 0,
                valueOut: null,
                inserted: null,
                valueCurrent: null,
            });
        }

        return result;
    }, []);

    const processedData = useMemo(() => {
        return props.data.reduce((acc, cur) => {
            const index = acc.findIndex((item) => getWeekOfMonth(item.timestamp) === getWeekOfMonth(cur.timestamp));
            if (index !== -1) {
                const existing = acc[index];
                existing.value = cur.value;
                existing.consumption = cur.consumption;
                existing.sensorId = cur.sensorId;

                if (cur.valueOut) {
                    if (!existing.valueOut) {
                        existing.valueOut = cur.valueOut;
                        existing.inserted = cur.inserted;
                        existing.sensorId = cur.sensorId;
                    }
                }
                if (cur.valueCurrent) {
                    if (!existing.valueCurrent) {
                        existing.valueCurrent = cur.valueCurrent;
                        existing.sensorId = cur.sensorId;
                    }
                }
            }

            return acc;
        }, fillArray);
    }, [fillArray, props.data]);

    return (
        <>
            {hasOutValues || hasCurrentValues ? (
                <div className="flex flex-row flex-wrap items-center justify-end gap-2">
                    <ChartSwitchButton
                        active={activeChart === "consumption"}
                        chart="consumption"
                        onClick={setActiveChart}
                        label="Verbrauch"
                    />
                    {hasOutValues ? (
                        <ChartSwitchButton
                            active={activeChart === "inserted"}
                            chart="inserted"
                            onClick={setActiveChart}
                            label="Einspeisung"
                        />
                    ) : null}
                    {hasCurrentValues ? (
                        <ChartSwitchButton
                            active={activeChart === "valueCurrent"}
                            chart="valueCurrent"
                            onClick={setActiveChart}
                            label={
                                <>
                                    <CircleSlash2Icon className="mr-2 h-3 w-3" />
                                    Leistung
                                </>
                            }
                        />
                    ) : null}
                </div>
            ) : null}
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
                        dataKey={activeChart}
                        type="number"
                        tickFormatter={(value) => value.toLocaleString()}
                        tickLine={false}
                        interval="equidistantPreserveStart"
                    />
                    {activeChart === "consumption" ? (
                        <Bar dataKey="consumption" fill="var(--color-consumption)" radius={4} />
                    ) : null}
                    {activeChart === "inserted" ? (
                        <Bar dataKey="inserted" fill="var(--color-inserted)" radius={4} />
                    ) : null}
                    {activeChart === "valueCurrent" ? (
                        <Bar dataKey="valueCurrent" fill="var(--color-valueCurrent)" radius={4} />
                    ) : null}
                </BarChart>
            </ChartContainer>
        </>
    );
}
