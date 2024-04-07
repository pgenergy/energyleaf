"use client";

import { format } from "date-fns";
import { de } from "date-fns/locale";
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
    const energy = data?.energy;
    const timestamp = data?.timestamp;

    if (!energy || !timestamp) {
        return null;
    }

    const formattedTimestamp = () => {
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) {
                throw new Error(`Invalid date: ${timestamp}`);
            }
    
            switch (aggregationType) {
                case AggregationType.RAW:
                    return format(date, "dd.MM.yyyy HH:mm");
                case AggregationType.HOUR:
                    return `${format(date, "HH")} Uhr`;
                case AggregationType.DAY:
                    return `Tag: ${format(date, "dd")}`;
                case AggregationType.MONTH:
                    return `Monat: ${format(date, "MMMM", { locale: de })}`;
                case AggregationType.YEAR:
                    return `Jahr: ${format(date, "yyyy")}`;
                default:
                    return "Unbekanntes Format";
            }
        } catch (error) {
            console.error("Fehler beim Formatieren des Zeitstempels:", error);
            return "Ungültiges Datum";
        }
    };

    return (
        <Card className="z-10">
            <CardHeader>
                <CardDescription>{formattedTimestamp()}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <p className="text-sm">
                    <span className="font-bold">Verbrauch:</span> {energy.toFixed(2)} kWh {computeTimestampLabel(aggregationType, true)}
                </p>
            </CardContent>
        </Card>
    );
}
