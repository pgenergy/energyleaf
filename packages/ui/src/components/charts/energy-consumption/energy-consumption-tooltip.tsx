"use client";

import { format, getISOWeek } from "date-fns";
import { de } from "date-fns/locale";
import { useMemo } from 'react';
import type { TooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { AggregationType, computeTimestampLabel } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader } from "@energyleaf/ui";

interface Props {
    aggregationType: AggregationType;
    tooltipProps: TooltipProps<ValueType, NameType>;
}

export default function EnergyConsumptionTooltip({ aggregationType, tooltipProps }: Props) {
    const payload = tooltipProps.payload;
    const data = payload?.[0]?.payload as
        | {
              energy: number;
              timestamp: string;
          }
        | undefined;

    const formattedTimestamp = useMemo(() => {
        if (!data?.timestamp) return "Datum fehlt";
        const date = new Date(data.timestamp);
        if (isNaN(date.getTime())) {
            return "Ungültiges Datum";
        }
        const formatOptions = {
            [AggregationType.RAW]: "dd.MM.yyyy HH:mm",
            [AggregationType.HOUR]: "HH 'Uhr'",
            [AggregationType.DAY]: "dd. MMMM yyyy",
            [AggregationType.MONTH]: "MMMM yyyy",
            [AggregationType.YEAR]: "yyyy",
            [AggregationType.WEEK]: `'KW' ${getISOWeek(date)} yyyy`
        };
        return format(date, formatOptions[aggregationType] || "dd.MM.yyyy", { locale: de });
    }, [data?.timestamp, aggregationType]);

    if (!data?.energy) {
        return null;
    }

    return (
        <Card className="z-10">
            <CardHeader>
                <CardDescription>{formattedTimestamp}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <p className="text-sm">
                    <span className="font-bold">Verbrauch:</span> {data.energy.toFixed(2)} {computeTimestampLabel(aggregationType, true)}
                </p>
            </CardContent>
        </Card>
    );
}
