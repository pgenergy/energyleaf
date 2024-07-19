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
import ChartSwitchButton from "@energyleaf/ui/charts/chart-switch-button";
import { format, startOfMonth } from "date-fns";
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

function getWeekOfMonth(date: Date): number {
    const dayOfMonth = date.getDate();

    const startMonth = startOfMonth(new Date());
    const startDay = startMonth.getDay();

    const weekStartAdjusted = startDay === 0 ? 7 : startDay;
    const offset = weekStartAdjusted > 1 ? 8 - weekStartAdjusted : 1;
    const weekNumber = Math.ceil((dayOfMonth + offset - 1) / 7);

    return weekNumber;
}

export default function WeekChart(props: Props) {
    const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>("value");

    function tickFormatter(value: Date) {
        const week = getWeekOfMonth(value);
        return `W ${week}`;
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
                valueOut: null,
                valueCurrent: null,
                isPeak: false,
                isAnomaly: false,
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
                existing.sensorId = cur.sensorId;

                if (cur.valueOut) {
                    if (!existing.valueOut) {
                        existing.valueOut = cur.valueOut;
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
                <div className="flex flex-row items-center justify-end gap-2">
                    <ChartSwitchButton
                        active={activeChart === "value"}
                        chart="value"
                        onClick={setActiveChart}
                        label="Verbrauch"
                    />
                    {hasOutValues ? (
                        <ChartSwitchButton
                            active={activeChart === "valueOut"}
                            chart="valueOut"
                            onClick={setActiveChart}
                            label="Einspeisung"
                        />
                    ) : null}
                    {hasCurrentValues ? (
                        <ChartSwitchButton
                            active={activeChart === "valueCurrent"}
                            chart="valueCurrent"
                            onClick={setActiveChart}
                            label="Leistung"
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
                    layout="vertical"
                >
                    <ChartLegend content={<ChartLegendContent />} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <YAxis
                        dataKey="timestamp"
                        type="category"
                        tickFormatter={(value) => tickFormatter(value)}
                        tickLine={false}
                        interval="equidistantPreserveStart"
                    />
                    <XAxis
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
