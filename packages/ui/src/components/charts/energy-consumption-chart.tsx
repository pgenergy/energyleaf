"use client";

import type { SensorDataSelectType, SensorDataSequenceType } from "@energyleaf/db/types";
import { AggregationType } from "@energyleaf/lib";
import clsx from "clsx";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useMemo, useState } from "react";
import { Area, AreaChart, ReferenceDot, Tooltip, XAxis, YAxis, ReferenceArea } from "recharts";
import type { CategoricalChartState } from "recharts/types/chart/types";
import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent } from "../../ui/chart";
import ChartSwitchButton from "./chart-switch-button";
import EnergyConsumptionTooltip from "./energy-consumption-tooltip";
import type { DeviceClassification } from "@energyleaf/lib";
import { GiWashingMachine } from 'react-icons/gi';
import { CiRouter } from "react-icons/ci";
import { BiFridge, BiSolidDryer } from "react-icons/bi";
import { LuMicrowave } from "react-icons/lu";
import { CgSmartHomeBoiler } from "react-icons/cg";
import { TbFreezeRow } from "react-icons/tb";

interface Props {
    data: SensorDataSelectType[];
    peaks?: SensorDataSequenceType[];
    cost?: number;
    showPeaks?: boolean;
    aggregation?: AggregationType;
    peaksCallback?: (value: SensorDataSequenceType) => void;
    zoomCallback?: (left: Date, right: Date) => void;
    classifiedData: DeviceClassification[];
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

const deviceIcons = {
    freezer: TbFreezeRow,
    fridge: BiFridge,
    micro_wave: LuMicrowave,
    router: CiRouter,
    boiler: CgSmartHomeBoiler,
    dryer: BiSolidDryer,
    washing_machine: GiWashingMachine,
};

const CustomDot = (props) => {
    const { cx, cy, dominantClassification } = props;
    const IconComponent = deviceIcons[dominantClassification];
    if (!IconComponent) return null;
    const size = 12;
    const iconProps = { x: cx - size / 2, y: cy - size / 2, width: size, height: size, color: 'white' };
    return (
        <g>
            <circle cx={cx} cy={cy} r={10} fill="blue" />
            <IconComponent {...iconProps} />
        </g>
    );
};

export function EnergyConsumptionChart({
    data,
    peaks,
    showPeaks,
    aggregation,
    cost,
    zoomCallback,
    peaksCallback,
    classifiedData,
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

    const sameDay = useMemo(() => {
        if (data.length === 0) return false;

        const firstDate = new Date(data[0].timestamp);
        return data.every((value) => {
            const date = new Date(value.timestamp);
            return date.getDate() === firstDate.getDate();
        });
    }, [data]);

    const showSeconds = useMemo(() => {
        if (data.length === 0) return false;

        const firstDate = new Date(data[0].timestamp);
        const lastDate = new Date(data[data.length - 1].timestamp);
        const diff = lastDate.getTime() - firstDate.getTime();
        return diff < 5 * 60 * 1000;
    }, [data]);

    const dynamicTickFormatter = (value: string) => {
        const date = new Date(value);
        if (aggregation === AggregationType.RAW) {
            if (sameDay) {
                if (showSeconds) {
                    return format(date, "HH:mm:ss");
                }
                return format(date, "HH:mm");
            }

            return format(date, "dd.MM: HH:mm");
        }

        if (aggregation === AggregationType.HOUR) {
            return format(date, "HH:00");
        }

        if (aggregation === AggregationType.DAY) {
            return format(date, "eeee", { locale: de });
        }

        if (aggregation === AggregationType.WEEK) {
            return format(date, "'KW' WW", { locale: de });
        }

        if (aggregation === AggregationType.MONTH) {
            return format(date, "MMMM", { locale: de });
        }

        if (aggregation === AggregationType.YEAR) {
            return format(date, "yyyy", { locale: de });
        }

        return format(date, "dd.MM: HH:mm:ss");
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

    return (
        <>
            {hasOutValues || hasCurrentValues || hasCost ? (
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
                    <ChartLegend content={<ChartLegendContent displayedValue={activeChart} />} />
                    <Tooltip
                        content={(props) => (
                            <EnergyConsumptionTooltip
                                aggregationType={aggregation ?? AggregationType.RAW}
                                tooltipProps={props}
                                classifiedData={aggregation === AggregationType.RAW && activeChart === "value" ? classifiedData : []}
                            />
                        )}
                    />
                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={dynamicTickFormatter}
                        type="category"
                        tickLine={false}
                        interval="equidistantPreserveStart"
                        axisLine={false}
                    />
                    <YAxis dataKey={activeChart} tickLine={false} interval="equidistantPreserveStart" type="number" />
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
                    {aggregation === AggregationType.RAW && activeChart === "value" && classifiedData
                        ? classifiedData.map((classification) => (
                              <ReferenceDot
                                  key={classification.timestamp}
                                  x={classification.timestamp}
                                  y={classification.power}
                                  r={10}
                                  fill="blue"
                                  stroke="blue"
                                  isFront
                                  shape={<CustomDot dominantClassification={classification.dominantClassification} />}
                              />
                          ))
                        : null}
                </AreaChart>
            </ChartContainer>
        </>
    );
}
