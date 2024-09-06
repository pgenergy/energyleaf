"use client";

import { AggregationType, computeTimestampLabel } from "@energyleaf/lib";
import type { SensorDataSelectType } from "@energyleaf/postgres/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useMemo } from "react";
import type { TooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { useChart } from "../../../ui/chart";

interface Props {
    aggregationType: AggregationType;
    tooltipProps: TooltipProps<ValueType, NameType>;
}

export default function EnergyConsumptionTooltip({ aggregationType, tooltipProps }: Props) {
    const { config } = useChart();
    const payload = tooltipProps.payload;
    const data = payload?.[0]?.payload as SensorDataSelectType & { cost?: number };

    const formattedTimestamp = useMemo(() => {
        if (!data?.timestamp) return "Datum fehlt";
        const date = new Date(data.timestamp);
        if (Number.isNaN(date.getTime())) {
            return "Ungültiges Datum";
        }
        const formatOptions = {
            [AggregationType.RAW]: "dd.MM.yyyy HH:mm:ss",
            [AggregationType.HOUR]: "HH 'Uhr'",
            [AggregationType.DAY]: "do",
            [AggregationType.WEEKDAY]: "iiii",
            [AggregationType.MONTH]: "MMMM",
            [AggregationType.YEAR]: "yyyy",
            [AggregationType.CALENDAR_WEEK]: `'KW' WW`,
            [AggregationType.WEEK]: `'Woche' WW`,
        };
        return format(date, formatOptions[aggregationType] || "dd.MM.yyyy HH:mm:ss", { locale: de });
    }, [data?.timestamp, aggregationType]);

    if (!data?.consumption) {
        return null;
    }

    return (
        <div className="z-10 flex flex-col gap-2 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
            <p className="font-bold">{formattedTimestamp}</p>
            <div className="flex flex-row items-center gap-1">
                <div
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]"
                    style={
                        {
                            "--color-bg": config.consumption.color,
                        } as React.CSSProperties
                    }
                />
                <p className="text-sm">
                    <span className="text-muted-foreground">Verbrauch </span>
                    <span className="font-medium font-mono">{data.consumption.toFixed(4)}</span>{" "}
                    {computeTimestampLabel(aggregationType, true)}
                </p>
            </div>
            {data.inserted ? (
                <div className="flex flex-row items-center gap-1">
                    <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]"
                        style={
                            {
                                "--color-bg": config.inserted.color,
                            } as React.CSSProperties
                        }
                    />
                    <p className="text-sm">
                        <span className="text-muted-foreground">Eingespeist </span>
                        <span className="font-medium font-mono">{data.inserted.toFixed(4)}</span>{" "}
                        {computeTimestampLabel(aggregationType, true)}
                    </p>
                </div>
            ) : null}
            {data.valueCurrent ? (
                <div className="flex flex-row items-center gap-1">
                    <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]"
                        style={{ "--color-bg": config.valueCurrent.color } as React.CSSProperties}
                    />
                    <p className="text-sm">
                        <span className="text-muted-foreground">Leistung </span>
                        <span className="font-medium font-mono">{data.valueCurrent.toFixed(4)}</span> W
                    </p>
                </div>
            ) : null}
            {data.cost ? (
                <div className="flex flex-row items-center gap-1">
                    <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]"
                        style={{ "--color-bg": config.cost.color } as React.CSSProperties}
                    />
                    <p className="text-sm">
                        <span className="text-muted-foreground">Kosten </span>
                        <span className="font-medium font-mono">{data.cost.toFixed(4)}</span> €
                    </p>
                </div>
            ) : null}
        </div>
    );
}
