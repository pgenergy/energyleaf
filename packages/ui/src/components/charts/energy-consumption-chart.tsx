"use client";

import type { SensorDataSelectType, SensorDataSequenceType } from "@energyleaf/db/types";
import { AggregationType } from "@energyleaf/lib";
import clsx from "clsx";
import { formatDate } from "date-fns";
import { useMemo, useState } from "react";
import { Area, AreaChart, ReferenceArea, Tooltip, XAxis, YAxis } from "recharts";
import type { CategoricalChartState } from "recharts/types/chart/types";
import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent } from "../../ui/chart";
import EnergyConsumptionTooltip from "./energy-consumption-tooltip";

interface Props {
    data: SensorDataSelectType[];
    peaks?: SensorDataSequenceType[];
    cost?: number;
    showPeaks?: boolean;
    aggregation?: AggregationType;
    peaksCallback?: (value: SensorDataSequenceType) => void;
    zoomCallback?: (left: Date, right: Date) => void;
}

const chartConfig = {
    value: {
        label: "Energieverbrauch (kWh)",
        color: "hsl(var(--primary))",
    },
    valueOut: {
        label: "Einspeisung (kWh)",
        color: "hsl(var(--chart-3))",
    },
    valueCurrent: {
        label: "Leistung (W)",
        color: "hsl(var(--chart-4))",
    },
    cost: {
        label: "Kosten (€)",
        color: "hsl(var(--chart-5))",
    },
} satisfies ChartConfig;

export function EnergyConsumptionChart({
    data,
    peaks,
    showPeaks,
    aggregation,
    cost,
    zoomCallback,
    peaksCallback,
}: Props) {
    const [leftValue, setLeftValue] = useState<CategoricalChartState | null>(null);
    const [rightValue, setRightValue] = useState<CategoricalChartState | null>(null);
    const [mouseDown, setMouseDown] = useState(false);
    const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>("value");

    const preparedData = useMemo(() => {
        return data.map((d) => ({
            ...d,
            timestamp: d.timestamp.toISOString(),
            ...(cost ? { cost: d.value * cost } : {}),
        }));
    }, [data, cost]);

    const hasOutValues = useMemo(() => {
        return data.some((d) => d.valueOut);
    }, [data]);

    const hasCurrentValues = useMemo(() => {
        return data.some((d) => d.valueCurrent);
    }, [data]);

    const hasCost = useMemo(() => {
        return preparedData.some((d) => d.cost);
    }, [preparedData]);

    const displayedItems = useMemo(() => {
        const values: string[] = ["value"];
        if (hasCurrentValues) {
            values.push("valueCurrent");
        }

        if (hasOutValues) {
            values.push("valueOut");
        }

        if (hasCost) {
            values.push("cost");
        }
        return values;
    }, [hasOutValues, hasCurrentValues, hasCost]);

    const sameDay = useMemo(() => {
        if (data.length === 0) return false;

        const firstDate = data[0].timestamp;
        return data.every((value) => {
            const date = value.timestamp;
            return date.getDate() === firstDate.getDate();
        });
    }, [data]);

    const showSeconds = useMemo(() => {
        if (data.length === 0) return false;

        const firstDate = data[0].timestamp;
        const lastDate = data[data.length - 1].timestamp;
        const diff = lastDate.getTime() - firstDate.getTime();
        return diff < 5 * 60 * 1000;
    }, [data]);

    const dynamicTickFormatter = (value: string) => {
        if (sameDay) {
            if (showSeconds) {
                return formatDate(new Date(value), "HH:mm:ss");
            }
            return formatDate(new Date(value), "HH:mm");
        }

        return formatDate(new Date(value), "dd.MM: HH:mm");
    };

    const handleZoom = () => {
        if (!leftValue || !rightValue || !zoomCallback) return;

        const leftX = leftValue.activeLabel;
        const rightX = rightValue.activeLabel;

        if (!leftX || !rightX) return;

        let leftDate = new Date(leftX);
        let rightDate = new Date(rightX);

        if (leftDate.getTime() > rightDate.getTime()) {
            [leftDate, rightDate] = [rightDate, leftDate];
        }

        zoomCallback(leftDate, rightDate);
        setLeftValue(null);
        setRightValue(null);
    };

    function getPeakXValues(peak: SensorDataSequenceType) {
        const result = {
            start: "",
            end: "",
        };
        if (preparedData.length === 0) return result;

        const first = preparedData[0];
        const last = preparedData[preparedData.length - 1];

        const refStart = new Date(first.timestamp);
        const refEnd = new Date(last.timestamp);

        if (refStart.getTime() > peak.start.getTime()) {
            result.start = dynamicTickFormatter(first.timestamp);
        } else {
            result.start = dynamicTickFormatter(peak.start.toISOString());
        }

        if (refEnd.getTime() < peak.end.getTime()) {
            result.end = dynamicTickFormatter(last.timestamp);
        } else {
            result.end = dynamicTickFormatter(peak.end.toISOString());
        }

        return result;
    }

    return (
        <ChartContainer className="min-h-52 w-full" config={chartConfig}>
            <AreaChart
                className="select-none"
                data={preparedData}
                margin={{
                    top: 16,
                    right: 10,
                    left: 10,
                    bottom: 16,
                }}
                onMouseDown={(e) => {
                    if (!zoomCallback) return;

                    setMouseDown(true);
                    setLeftValue(e);
                }}
                onMouseMove={(e) => {
                    if (!leftValue || !zoomCallback || !mouseDown) return;

                    setRightValue(e);
                }}
                onMouseUp={() => {
                    setMouseDown(false);
                    handleZoom();
                }}
            >
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
                    <linearGradient id="costColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-cost)" stopOpacity={0.99} />
                        <stop offset="50%" stopColor="var(--color-cost)" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="var(--color-cost)" stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <ChartLegend
                    content={
                        <ChartLegendContent
                            setActiveChart={setActiveChart}
                            displayedItems={displayedItems}
                            activeLabel={activeChart}
                        />
                    }
                />
                <Tooltip
                    content={(props) => (
                        <EnergyConsumptionTooltip
                            aggregationType={aggregation ?? AggregationType.RAW}
                            tooltipProps={props}
                        />
                    )}
                />
                <XAxis
                    dataKey="timestamp"
                    tickFormatter={dynamicTickFormatter}
                    tickLine={false}
                    interval="equidistantPreserveStart"
                    axisLine={false}
                />
                <YAxis dataKey={activeChart} tickLine={false} interval="equidistantPreserveStart" />
                {activeChart === "value" ? (
                    <Area
                        dataKey="value"
                        fill="url(#valueColor)"
                        fillOpacity={1}
                        stroke="var(--color-value)"
                        type="linear"
                    />
                ) : null}
                {activeChart === "valueOut" ? (
                    <Area
                        dataKey="valueOut"
                        fill="url(#valueOutColor)"
                        fillOpacity={1}
                        stroke="var(--color-valueOut)"
                        type="linear"
                    />
                ) : null}
                {activeChart === "valueCurrent" ? (
                    <Area
                        dataKey="valueCurrent"
                        fill="url(#valueCurrentColor)"
                        fillOpacity={1}
                        stroke="var(--color-valueCurrent)"
                        type="linear"
                    />
                ) : null}
                {activeChart === "cost" ? (
                    <Area
                        dataKey="cost"
                        fill="url(#costColor)"
                        fillOpacity={1}
                        stroke="var(--color-cost)"
                        type="linear"
                    />
                ) : null}
                {showPeaks && peaks
                    ? peaks.map((peak) => {
                          const xValues = getPeakXValues(peak);
                          return (
                              <ReferenceArea
                                  className={clsx(peaksCallback ? "cursor-pointer" : "cursor-default")}
                                  fill="hsl(var(--destructive))"
                                  fillOpacity={0.2}
                                  stroke="hsl(var(--destructive))"
                                  strokeOpacity={0.3}
                                  isFront
                                  key={peak.id}
                                  onClick={() => peaksCallback?.(peak)}
                                  x1={xValues.start}
                                  x2={xValues.end}
                              />
                          );
                      })
                    : null}
                {leftValue && rightValue && zoomCallback ? (
                    <ReferenceArea
                        x1={leftValue.activeLabel}
                        x2={rightValue.activeLabel}
                        strokeOpacity={0.3}
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.2}
                    />
                ) : null}
            </AreaChart>
        </ChartContainer>
    );
}
