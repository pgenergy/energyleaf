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
import { format, setDay } from "date-fns";
import { de } from "date-fns/locale";
import { CircleSlash2Icon } from "lucide-react";
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
        color: "hsl(var(--chart-3))",
    },
    valueCurrent: {
        label: "Leistung (W)",
        color: "hsl(var(--chart-4))",
    },
} satisfies ChartConfig;

export default function EnergyDayChart(props: Props) {
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

    const fillArray = useMemo(() => {
        const result: SensorDataSelectType[] = [];

        for (let i = 1; i < 8; i++) {
            const weekDay = i % 7;
            const date = setDay(new Date(), weekDay);

            result.push({
                id: i.toString(),
                sensorId: "",
                timestamp: date,
                value: 0,
                valueOut: null,
                valueCurrent: null,
            });
        }

        return result;
    }, []);

    const processedData = useMemo(() => {
        return props.data.reduce((acc, cur) => {
            const index = acc.findIndex((item) => item.timestamp.getDay() === cur.timestamp.getDay());
            if (index !== -1) {
                const existing = acc[index];
                existing.value = cur.value;
                existing.sensorId = cur.sensorId;

                if (cur.valueOut && !existing.valueOut) {
                    existing.valueOut = cur.valueOut;
                    existing.sensorId = cur.sensorId;
                }
                if (cur.valueCurrent && !existing.valueCurrent) {
                    existing.valueCurrent = cur.valueCurrent;
                    existing.sensorId = cur.sensorId;
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
                    {activeChart === "value" ? <Bar dataKey="value" fill="var(--color-value)" radius={4} /> : null}
                    {activeChart === "valueOut" ? (
                        <Bar dataKey="valueOut" fill="var(--color-valueOut)" radius={4} />
                    ) : null}
                    {activeChart === "valueCurrent" ? (
                        <Bar dataKey="valueCurrent" fill="var(--color-valueCurrent)" radius={4} />
                    ) : null}
                </BarChart>
            </ChartContainer>
        </>
    );
}
