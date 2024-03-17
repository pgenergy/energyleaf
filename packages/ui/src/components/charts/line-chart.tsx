"use client";

import { useMemo } from "react";
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
        let lastSeenDate = "";
        const dateInterval = Math.max(1, Math.ceil(diffDays / 20)); // Dynamisches Intervall für die Anzeige von Datenpunkten

        // Bestimmen des letzten Zeitpunkts als String
        const lastTimeStr = format(maxDate, "HH:mm");
        // Überprüfen, ob der letzte Zeitpunkt 00:00 ist (könnte je nach Anwendungsfall angepasst werden)
        const isLastTimeMidnight = lastTimeStr === "00:00";
    
        return (value: string) => {
            if (!isValid(parseISO(value))) {
                return value;
            }
            const date = parseISO(value);
            const dateStr = format(date, "dd.MM");
            const hourStr = format(date, "HH") + ":00";
            const currentDateDiff = differenceInCalendarDays(date, minDate);

            // Nichts zurückgeben, wenn der Wert der letzte Zeitpunkt ist und dieser 00:00 entspricht
            if (isLastTimeMidnight && format(date, "HH:mm") === lastTimeStr) {
                return '';
            }
    
            if (diffDays <= 1) {
                if (lastSeenHour !== hourStr) {
                    lastSeenHour = hourStr;
                    return hourStr;
                }
                return '';
            } else {
                if (currentDateDiff % dateInterval === 0 && lastSeenDate !== dateStr) { // Nur ausgewählte Daten anzeigen
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
