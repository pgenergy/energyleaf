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
import { format } from "date-fns";
import { CircleSlash2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

interface Props {
    data: SensorDataSelectType[];
    compareData: SensorDataSelectType[];
    date: Date;
    compareDate: Date;
}

export default function EnergyCompareChart(props: Props) {
    const chartConfig = useMemo(
        () =>
            ({
                consumption: {
                    label: `${format(props.date, "PP")} - Verbrauch (kWh)`,
                    color: "hsl(var(--primary))",
                },
                consumptionCompare: {
                    label: `${format(props.compareDate, "PP")} - Verbrauch (kWh)`,
                    color: "hsl(var(--chart-3))",
                },
                inserted: {
                    label: `${format(props.date, "PP")} - Eingespeist (kWh)`,
                    color: "hsl(var(--chart-4))",
                },
                insertedCompare: {
                    label: `${format(props.compareDate, "PP")} - Eingespeist (kWh)`,
                    color: "hsl(var(--chart-3))",
                },
                valueCurrent: {
                    label: `${format(props.date, "PP")} - Leistung (W)`,
                    color: "hsl(var(--chart-5))",
                },
                valueCurrentCompare: {
                    label: `${format(props.compareDate, "PP")} - Leistung (W)`,
                    color: "hsl(var(--chart-3))",
                },
            }) satisfies ChartConfig,
        [props.date, props.compareDate],
    );

    const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>("consumption");

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

    const fillArray = useMemo(() => {
        const result: SensorDataSelectType[] = [];

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
            });
        }

        return result;
    }, []);

    const processedData = useMemo(() => {
        const results: (SensorDataSelectType & {
            valueCompare: number;
            consumptionCompare: number;
            valueOutCompare: number | null;
            insertedCompare: number | null;
            valueCurrentCompare: number | null;
        })[] = [];
        for (let i = 0; i < fillArray.length; i++) {
            const result: SensorDataSelectType & {
                valueCompare: number;
                consumptionCompare: number;
                valueOutCompare: number | null;
                insertedCompare: number | null;
                valueCurrentCompare: number | null;
            } = {
                id: "",
                sensorId: "",
                timestamp: new Date(),
                value: 0,
                valueCompare: 0,
                consumption: 0,
                consumptionCompare: 0,
                valueOut: null,
                valueOutCompare: null,
                inserted: null,
                insertedCompare: null,
                valueCurrent: null,
                valueCurrentCompare: null,
            };
            const cur = fillArray[i];
            const dataIndex = props.data.findIndex((item) => item.timestamp.getHours() === cur.timestamp.getHours());
            const compareDataIndex = props.compareData.findIndex(
                (item) => item.timestamp.getHours() === cur.timestamp.getHours(),
            );

            if (dataIndex !== -1) {
                const data = props.data[dataIndex];
                result.id = data.id;
                result.sensorId = data.sensorId;
                result.value = data.value;
                result.consumption = data.consumption;
                result.timestamp = data.timestamp;

                if (data.valueOut) {
                    result.valueOut = data.valueOut;
                    result.inserted = data.inserted;
                }

                if (data.valueCurrent) {
                    result.valueCurrent = data.valueCurrent;
                }
            }

            if (compareDataIndex !== -1) {
                const compareData = props.compareData[compareDataIndex];
                result.valueCompare = compareData.value;
                result.consumptionCompare = compareData.consumption;

                if (compareData.valueOut) {
                    result.valueOutCompare = compareData.valueOut;
                    result.insertedCompare = compareData.inserted;
                }

                if (compareData.valueCurrent) {
                    result.valueCurrentCompare = compareData.valueCurrent;
                }
            }

            results.push(result);
        }

        return results;
    }, [fillArray, props.data, props.compareData]);

    return (
        <>
            {hasOutValues || hasCurrentValues ? (
                <div className="flex flex-row flex-wrap items-center justify-end gap-2">
                    <ChartSwitchButton
                        active={activeChart === "consumption"}
                        chart="value"
                        onClick={setActiveChart}
                        label="Verbrauch"
                    />
                    {hasOutValues ? (
                        <ChartSwitchButton
                            active={activeChart === "inserted"}
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
                    {activeChart === "consumption" ? (
                        <>
                            <Bar dataKey="consumption" fill="var(--color-consumption)" radius={4} />
                            <Bar dataKey="consumptionCompare" fill="var(--color-consumptionCompare)" radius={4} />
                        </>
                    ) : null}
                    {activeChart === "inserted" ? (
                        <>
                            <Bar dataKey="inserted" fill="var(--color-inserted)" radius={4} />
                            <Bar dataKey="insertedCompare" fill="var(--color-insertedCompare)" radius={4} />
                        </>
                    ) : null}
                    {activeChart === "valueCurrent" ? (
                        <>
                            <Bar dataKey="valueCurrent" fill="var(--color-valueCurrent)" radius={4} />
                            <Bar dataKey="valueCurrentCompare" fill="var(--color-valueCurrentCompare)" radius={4} />
                        </>
                    ) : null}
                </BarChart>
            </ChartContainer>
        </>
    );
}
