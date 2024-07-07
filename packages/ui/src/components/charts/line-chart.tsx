"use client";

import { clsx } from "clsx";
import { formatDate } from "date-fns";
import { useMemo, useState } from "react";
import {
    Area,
    AreaChart,
    Label,
    ReferenceArea,
    ReferenceDot,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { CategoricalChartState } from "recharts/types/chart/types";

type AxesValue = string | number | undefined;

interface Props {
    keyName: string;
    data: Record<string, AxesValue>[];
    xAxes?: {
        dataKey: string;
        name?: string;
    };
    yAxes?: {
        dataKey: string;
        name?: string;
    };
    tooltip?: {
        content: React.FC;
    };
    referencePoints?: {
        data: Record<string, AxesValue>[];
        xKeyName: string;
        yKeyName: string;
        callback?: (value: Record<string, AxesValue>) => void;
    };
    zoomCallback?: (left: Date, right: Date) => void;
}

export function LineChart({ keyName, data, xAxes, yAxes, tooltip, referencePoints, zoomCallback }: Props) {
    const [leftValue, setLeftValue] = useState<CategoricalChartState | null>(null);
    const [rightValue, setRightValue] = useState<CategoricalChartState | null>(null);
    const [mouseDown, setMouseDown] = useState(false);

    const sameDay = useMemo(() => {
        if (data.length === 0 || !xAxes?.dataKey) return false;

        const firstDate = new Date(data[0][xAxes?.dataKey] as string);
        return data.every((value) => {
            const date = new Date(value[xAxes?.dataKey] as string);
            return date.getDate() === firstDate.getDate();
        });
    }, [data, xAxes?.dataKey]);

    const dynamicTickFormatter = (value: string) => {
        if (sameDay) {
            return formatDate(new Date(value), "HH:00");
        }

        return formatDate(new Date(value), "dd.MM HH:00");
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
        <ResponsiveContainer height="100%" width="100%">
            <AreaChart
                className="select-none"
                data={data}
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
                    <linearGradient id="fillColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.99} />
                        <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey={xAxes?.dataKey}
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={dynamicTickFormatter}
                    tickLine={false}
                    interval="equidistantPreserveStart"
                >
                    {xAxes?.name ? (
                        <Label
                            offset={0}
                            position="bottom"
                            style={{
                                color: "hsl(var(--muted-foreground))",
                            }}
                            value={xAxes.name}
                        />
                    ) : null}
                </XAxis>
                <YAxis dataKey={yAxes?.dataKey} stroke="hsl(var(--muted-foreground))">
                    {yAxes?.name ? (
                        <Label
                            angle={270}
                            offset={0}
                            position="left"
                            style={{
                                color: "hsl(var(--muted-foreground))",
                                textAnchor: "middle",
                            }}
                            value={yAxes.name}
                        />
                    ) : null}
                </YAxis>
                {tooltip ? <Tooltip content={tooltip.content} /> : null}
                <Area
                    dataKey={keyName}
                    fill="url(#fillColor)"
                    fillOpacity={0.4}
                    stroke="hsl(var(--primary))"
                    type="natural"
                />
                {referencePoints
                    ? referencePoints.data.map((value) => (
                          <ReferenceDot
                              className={clsx(referencePoints.callback ? "cursor-pointer" : "cursor-default")}
                              fill="hsl(var(--destructive))"
                              isFront
                              key={`${value[referencePoints.xKeyName]?.toString()}-${value[
                                  referencePoints.yKeyName
                              ]?.toString()}`}
                              onClick={() => referencePoints?.callback?.(value)}
                              onMouseDown={(_, e) => {
                                  e.stopPropagation();
                              }}
                              onMouseMove={(_, e) => {
                                  e.stopPropagation();
                              }}
                              onMouseUp={(_, e) => {
                                  e.stopPropagation();
                              }}
                              r={10}
                              stroke="hsl(var(--destructive))"
                              x={value[referencePoints.xKeyName]}
                              y={value[referencePoints.yKeyName]}
                          />
                      ))
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
        </ResponsiveContainer>
    );
}
