"use client";

import { useCallback, useMemo } from "react";
import { clsx } from "clsx";
import { format, parseISO, differenceInCalendarDays, isValid, min, max } from "date-fns";
import { Area, AreaChart, Label, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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
}

export function LineChart({ keyName, data, xAxes, yAxes, tooltip, referencePoints }: Props) {
    const dynamicTickFormatter = useMemo(() => {
        const dates = data.map(d => new Date(d[xAxes?.dataKey as string] as string));
        if (dates.length === 0) {
            return (value: string) => value;
        }
        const minDate = min(dates);
        const maxDate = max(dates);
        const diffDays = differenceInCalendarDays(maxDate, minDate);
        
        let lastSeenHour = "";
        let lastSeenDate = ""; // Verschiebung nach außen, um den Zustand zwischen den Aufrufen zu behalten
    
        return (value: string) => {
            if (!isValid(parseISO(value))) {
                return value;
            }
            const date = parseISO(value);
            const dateStr = format(date, "dd.MM");
            const hourStr = format(date, "HH") + ":00";
    
            if (diffDays <= 1) {
                // Jede volle Stunde nur einmal anzeigen
                if (lastSeenHour !== hourStr) {
                    lastSeenHour = hourStr;
                    return hourStr;
                }
                return '';
            } else {
                // Datum nur einmal anzeigen
                if (lastSeenDate !== dateStr) {
                    lastSeenDate = dateStr;
                    return dateStr;
                }
                return '';
            }
        };
    }, [data, xAxes]);                  

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
                {referencePoints?.data.map((value) => (
                    <ReferenceDot
                        className={clsx(referencePoints?.callback ? "cursor-pointer" : "cursor-default")}
                        fill="hsl(var(--destructive))"
                        isFront
                        key={`${value[referencePoints.xKeyName]?.toString()}-${value[referencePoints.yKeyName]?.toString()}`}
                        onClick={() => referencePoints?.callback && referencePoints.callback(value)}
                        r={10}
                        stroke="hsl(var(--destructive))"
                        x={value[referencePoints.xKeyName]}
                        y={value[referencePoints.yKeyName]}
                    />
                ))}
            </AreaChart>
        </ResponsiveContainer>
    );
}
