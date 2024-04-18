"use client";

import { useCallback, useState } from "react";
import { clsx } from "clsx";
import { format, isValid } from "date-fns";
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
    const formatter = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- tickFormatter is any
        (value: any, _index: number) => {
            const workDate = value as string | number | null;
            if (workDate && isValid(new Date(workDate)) && xAxes) {
                if (
                    new Date(data[0][xAxes.dataKey] as string).getDate ===
                    new Date(data[data.length - 1][xAxes.dataKey] as string).getDate
                ) {
                    return format(new Date(workDate), "HH:mm");
                }
                return format(new Date(workDate), "dd.MM.yyyy");
            }

            return workDate?.toString() || "";
        },
        [data, xAxes],
    );

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
                {xAxes ? (
                    <XAxis
                        dataKey={xAxes.dataKey}
                        interval="equidistantPreserveStart"
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={formatter}
                    >
                        {xAxes.name ? (
                            <Label
                                offset={0}
                                position="insideBottom"
                                style={{
                                    color: "hsl(var(--muted-foreground))",
                                }}
                                value={xAxes.name}
                            />
                        ) : null}
                    </XAxis>
                ) : null}
                {yAxes ? (
                    <YAxis dataKey={yAxes.dataKey} stroke="hsl(var(--muted-foreground))">
                        {yAxes.name ? (
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
                        ) : null}
                    </YAxis>
                ) : null}
                {tooltip ? <Tooltip content={tooltip.content} /> : null}
                <Area
                    dataKey={keyName}
                    fill="url(#color)"
                    fillOpacity={1}
                    stroke="hsl(var(--primary))"
                    type="monotone"
                />
                {referencePoints
                    ? referencePoints.data.map((value) => {
                          return (
                              <ReferenceDot
                                  className={clsx(referencePoints.callback ? "cursor-pointer" : "cursor-default")}
                                  fill="hsl(var(--destructive))"
                                  isFront
                                  key={`${value[referencePoints.xKeyName]?.toString() || ""}-${
                                      value[referencePoints.yKeyName]?.toString() || ""
                                  }`}
                                  onClick={() => {
                                      if (referencePoints.callback) {
                                          referencePoints.callback(value);
                                      }
                                  }}
                                  r={10}
                                  stroke="hsl(var(--destructive))"
                                  x={value[referencePoints.xKeyName]}
                                  y={value[referencePoints.yKeyName]}
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
        </ResponsiveContainer>
    );
}
