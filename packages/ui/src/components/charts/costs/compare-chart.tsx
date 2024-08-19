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
import { format } from "date-fns";
import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

interface Props {
    data: (SensorDataSelectType & { cost: number })[];
    compareData: (SensorDataSelectType & { cost: number })[];
    date: Date;
    compareDate: Date;
}

export default function EnergyCompareChart(props: Props) {
    const chartConfig = useMemo(
        () =>
            ({
                cost: {
                    label: `${format(props.date, "PP")} - Kosten (€)`,
                    color: "hsl(var(--chart-5))",
                },
                costCompare: {
                    label: `${format(props.compareDate, "PP")} - Kosten (€)`,
                    color: "hsl(var(--chart-3))",
                },
            }) satisfies ChartConfig,
        [props.date, props.compareDate],
    );

    function tickFormatter(value: Date) {
        const hour = format(value, "HH");
        return `${hour} Uhr`;
    }

    const fillArray = useMemo(() => {
        const result: (SensorDataSelectType & { cost: number; costCompare: number })[] = [];

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
                costCompare: 0,
            });
        }

        return result;
    }, []);

    const processedData = useMemo(() => {
        const results: (SensorDataSelectType & {
            cost: number;
            costCompare: number;
        })[] = [];
        for (let i = 0; i < fillArray.length; i++) {
            const result: SensorDataSelectType & {
                cost: number;
                costCompare: number;
            } = {
                id: "",
                sensorId: "",
                timestamp: new Date(),
                value: 0,
                consumption: 0,
                cost: 0,
                costCompare: 0,
                valueOut: null,
                inserted: null,
                valueCurrent: null,
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
                result.cost = data.cost;
                result.timestamp = data.timestamp;
            }

            if (compareDataIndex !== -1) {
                const compareData = props.compareData[compareDataIndex];
                result.costCompare = compareData.cost;
            }

            results.push(result);
        }

        return results;
    }, [fillArray, props.data, props.compareData]);

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
                <Bar dataKey="costCompare" fill="var(--color-costCompare)" radius={4} />
            </BarChart>
        </ChartContainer>
    );
}
