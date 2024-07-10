"use client";

import type { SensorDataSelectType } from "@energyleaf/db/types";
import { AggregationType, computeTimestampLabel } from "@energyleaf/lib";
import { format, getISOWeek } from "date-fns";
import { de } from "date-fns/locale";
import { useMemo } from "react";
import type { TooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { useChart } from "../../ui/chart";

interface Props {
    aggregationType: AggregationType;
    tooltipProps: TooltipProps<ValueType, NameType>;
}

export default function EnergyConsumptionTooltip({ aggregationType, tooltipProps }: Props) {
    const { config } = useChart();
    const payload = tooltipProps.payload;
    const data = payload?.[0]?.payload as SensorDataSelectType;

    const formattedTimestamp = useMemo(() => {
        if (!data?.timestamp) return "Datum fehlt";
        const date = new Date(data.timestamp);
        if (Number.isNaN(date.getTime())) {
            return "Ungültiges Datum";
        }
        const formatOptions = {
            [AggregationType.RAW]: "dd.MM.yyyy HH:mm:ss",
            [AggregationType.HOUR]: "HH 'Uhr'",
            [AggregationType.DAY]: "dd. MMMM yyyy",
            [AggregationType.MONTH]: "MMMM yyyy",
            [AggregationType.YEAR]: "yyyy",
            [AggregationType.WEEK]: `'KW' ${getISOWeek(date)} yyyy`,
        };
        return format(date, formatOptions[aggregationType] || "dd.MM.yyyy", { locale: de });
    }, [data?.timestamp, aggregationType]);

    if (!data?.value) {
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
                            "--color-bg": config.value.color,
                        } as React.CSSProperties
                    }
                />
                <p className="text-sm">
                    <span className="font-bold">Verbrauch:</span> {data.value.toFixed(4)}{" "}
                    {computeTimestampLabel(aggregationType, true)}
                </p>
            </div>
            {data.valueOut ? (
                <div className="flex flex-row items-center gap-1">
                    <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]"
                        style={
                            {
                                "--color-bg": config.valueOut.color,
                            } as React.CSSProperties
                        }
                    />
                    <p className="text-sm">
                        <span className="font-bold">Eingespeist:</span> {data.valueOut.toFixed(4)}{" "}
                        {computeTimestampLabel(aggregationType, true)}
                    </p>
                </div>
            ) : null}
            {data.valueCurrent ? (
                <div className="flex flex-row items-center gap-1">
                    <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]"
                        style={
                            {
                                "--color-bg": config.valueCurrent.color,
                            } as React.CSSProperties
                        }
                    />
                    <p className="text-sm">
                        <span className="font-bold">Leistung:</span> {data.valueCurrent.toFixed(4)} W
                    </p>
                </div>
            ) : null}
        </div>
    );
}
