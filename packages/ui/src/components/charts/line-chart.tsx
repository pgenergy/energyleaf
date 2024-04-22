"use client";

import { clsx } from "clsx";
import { differenceInCalendarDays, format, isValid, max, min, parseISO } from "date-fns";
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
    const dynamicTickFormatter = useMemo(() => {
        const dates = data.map((d) => new Date(d[xAxes?.dataKey as string] as string));
        if (dates.length === 0) {
            return (value: string) => value;
        }
        const minDate = min(dates);
        const maxDate = max(dates);
        const diffDays = differenceInCalendarDays(maxDate, minDate);

        let lastSeenHour = "";
        let lastSeenDate = "";
        const dateInterval = Math.max(1, Math.ceil(diffDays / 20)); // Ensures the interval between displayed dates in the chart is at least 1 and adapts dynamically to span 20 intervals across the date range

        const lastDateStr = format(maxDate, "dd.MM");
        const lastHourStr = `${format(maxDate, "HH")}:00`;

        return (value: string) => {
            if (!isValid(parseISO(value))) {
                return value;
            }
            const date = parseISO(value);
            const dateStr = format(date, "dd.MM");
            const hourStr = `${format(date, "HH")}:00`;
            const currentDateDiff = differenceInCalendarDays(date, minDate);

            if (diffDays <= 1) {
                if (dateStr === lastDateStr && hourStr === lastHourStr) {
                    return "";
                }
                if (lastSeenHour !== hourStr) {
                    lastSeenHour = hourStr;
                    return hourStr;
                }
                return "";
            }

            if (currentDateDiff % dateInterval === 0 && lastSeenDate !== dateStr) {
                lastSeenDate = dateStr;
                return dateStr;
            }
            return "";
        };
    }, [data, xAxes]);

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
                data={data}
                margin={{
                    top: 0,
                    right: 0,
                    left: 0,
                    bottom: 0,
                }}
                onMouseDown={(e) => {
                    if (!zoomCallback) return;

                    setLeftValue(e);
                }}
                onMouseMove={(e) => {
                    if (!leftValue || !zoomCallback) return;

                    setRightValue(e);
                }}
                onMouseUp={handleZoom}
            >
                <defs>
                    <linearGradient id="color" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey={xAxes?.dataKey}
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={dynamicTickFormatter}
                    tickLine={false}
                >
                    {xAxes?.name && (
                        <Label
                            offset={0}
                            position="insideBottom"
                            style={{
                                color: "hsl(var(--muted-foreground))",
                            }}
                            value={xAxes.name}
                        />
                    )}
                </XAxis>
                <YAxis dataKey={yAxes?.dataKey} stroke="hsl(var(--muted-foreground))">
                    {yAxes?.name && (
                        <Label
                            angle={270}
                            offset={10}
                            position="insideLeft"
                            style={{
                                color: "hsl(var(--muted-foreground))",
                                textAnchor: "middle",
                            }}
                            value={yAxes.name}
                        />
                    )}
                </YAxis>
                {tooltip && <Tooltip content={tooltip.content} />}
                <Area
                    dataKey={keyName}
                    fill="url(#color)"
                    fillOpacity={1}
                    stroke="hsl(var(--primary))"
                    type="monotone"
                />
                {referencePoints
                    ? referencePoints?.data.map((value) => (
                          <ReferenceDot
                              className={clsx(referencePoints?.callback ? "cursor-pointer" : "cursor-default")}
                              fill="hsl(var(--destructive))"
                              isFront
                              key={`${value[referencePoints.xKeyName]?.toString()}-${value[
                                  referencePoints.yKeyName
                              ]?.toString()}`}
                              onClick={() => referencePoints?.callback?.(value)}
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
