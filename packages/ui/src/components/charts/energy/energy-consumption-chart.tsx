"use client";

import { AggregationType } from "@energyleaf/lib";
import type { SensorDataSelectType, SensorDataSequenceSelectType } from "@energyleaf/postgres/types";
import clsx from "clsx";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useMemo, useState } from "react";
import { Area, AreaChart, ReferenceArea, Tooltip, XAxis, YAxis } from "recharts";
import type { CategoricalChartState } from "recharts/types/chart/types";
import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent } from "../../../ui/chart";
import ChartSwitchButton from "../chart-switch-button";
import EnergyConsumptionCustomTick from "./energy-consumption-custom-tick";
import EnergyConsumptionTooltip from "./energy-consumption-tooltip";

interface Props {
    data: SensorDataSelectType[];
    peaks?: SensorDataSequenceSelectType[];
    cost?: number;
    showPeaks?: boolean;
    aggregation?: AggregationType;
    peaksCallback?: (value: SensorDataSequenceSelectType) => void;
    zoomCallback?: (left: Date, right: Date) => void;
}

const chartConfig = {
    consumption: {
        label: "Energieverbrauch (kWh)",
        color: "hsl(var(--primary))",
    },
    inserted: {
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
    const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>("consumption");

    const preparedData = useMemo(() => {
        return data.map((d) => ({
            ...d,
            timestamp: d.timestamp.toISOString(),
            ...(cost ? { cost: d.consumption * cost } : {}),
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
        if (aggregation === AggregationType.RAW) {
            if (sameDay) {
                if (showSeconds) {
                    return format(new Date(value), "HH:mm:ss");
                }
                return format(new Date(value), "HH:mm");
            }

            const formatDate = new Date(value);
            return [format(formatDate, "dd.MM."), format(formatDate, "HH:mm")];
        }

        if (aggregation === AggregationType.HOUR) {
            return format(new Date(value), "HH 'Uhr'");
        }

        if (aggregation === AggregationType.DAY) {
            return format(new Date(value), "do", { locale: de });
        }

        if (aggregation === AggregationType.WEEKDAY) {
            return format(new Date(value), "iiii", { locale: de });
        }

        if (aggregation === AggregationType.CALENDAR_WEEK) {
            return format(new Date(value), "'KW' WW", { locale: de });
        }

        if (aggregation === AggregationType.WEEK) {
            return format(new Date(value), "'Woche' WW", { locale: de });
        }

        if (aggregation === AggregationType.MONTH) {
            return format(new Date(value), "MMMM", { locale: de });
        }

        if (aggregation === AggregationType.YEAR) {
            return format(new Date(value), "yyyy", { locale: de });
        }

        return format(new Date(value), "dd.MM: HH:mm:ss");
    };

    const handleZoom = () => {
        if (!leftValue || !rightValue || !zoomCallback) return;

        const leftX = leftValue.activeLabel;
        const rightX = rightValue.activeLabel;

        if (!leftX || !rightX) return;

        if (Math.abs(new Date(leftX).getTime() - new Date(rightX).getTime()) < 1 * 60 * 1000) {
            return;
        }

        let leftDate = new Date(leftX);
        let rightDate = new Date(rightX);

        if (leftDate.getTime() > rightDate.getTime()) {
            [leftDate, rightDate] = [rightDate, leftDate];
        }

        zoomCallback(leftDate, rightDate);
        setLeftValue(null);
        setRightValue(null);
    };

    return (
        <>
            {hasOutValues || hasCurrentValues || hasCost ? (
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
                            label="Leistung"
                        />
                    ) : null}
                    {hasCost ? (
                        <ChartSwitchButton
                            active={activeChart === "cost"}
                            chart="cost"
                            onClick={setActiveChart}
                            label="Kosten"
                        />
                    ) : null}
                </div>
            ) : null}
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
                        <linearGradient id="costColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-cost)" stopOpacity={0.99} />
                            <stop offset="50%" stopColor="var(--color-cost)" stopOpacity={0.7} />
                            <stop offset="95%" stopColor="var(--color-cost)" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <ChartLegend content={<ChartLegendContent displayedValue={activeChart} />} />
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
                        tick={(props) => (
                            <EnergyConsumptionCustomTick
                                tickFormatter={dynamicTickFormatter}
                                svgProps={props}
                                payload={props.payload}
                            />
                        )}
                        tickFormatter={(val) => {
                            const formatted = dynamicTickFormatter(val);
                            return Array.isArray(formatted) ? formatted.join(" ") : formatted;
                        }}
                        type="category"
                        tickLine={false}
                        interval="equidistantPreserveStart"
                        axisLine={false}
                    />
                    <YAxis dataKey={activeChart} tickLine={false} interval="equidistantPreserveStart" type="number" />
                    {activeChart === "consumption" ? (
                        <Area
                            dataKey="consumption"
                            fill="url(#consumptionColor)"
                            fillOpacity={1}
                            stroke="var(--color-consumption)"
                            type="linear"
                        />
                    ) : null}
                    {activeChart === "inserted" ? (
                        <Area
                            dataKey="valueOut"
                            fill="url(#insertedColor)"
                            fillOpacity={1}
                            stroke="var(--color-inserted)"
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
                                      x1={peak.start.toISOString()}
                                      x2={peak.end.toISOString()}
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
        </>
    );
}
