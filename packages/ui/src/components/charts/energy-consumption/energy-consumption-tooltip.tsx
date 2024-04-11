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
        if (aggregationType === AggregationType.RAW) {
            return format(new Date(timestamp), "dd.MM.yyyy HH:mm");
        }

        if (aggregationType === AggregationType.HOUR) {
            return `${format(new Date(timestamp), "HH")} Uhr`;
        }

        if (aggregationType === AggregationType.DAY) {
            return `Tag: ${format(new Date(timestamp), "dd")}`;
        }

        if (aggregationType === AggregationType.MONTH) {
            return `Monat: ${format(new Date(timestamp), "MMMM", {
                locale: de,
            })}`;
        }

        if (aggregationType === AggregationType.YEAR) {
            return `Jahr: ${format(new Date(timestamp), "yyyy")}`;
        }
    };

    return (
        <Card className="z-10">
            <CardHeader>
                <CardDescription>{formattedTimestamp()}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <p className="text-sm">
                    <span className="font-bold">Verbrauch:</span> {energy.toFixed(2)}{" "}
                    {computeTimestampLabel(aggregationType, true)}
                </p>
            </CardContent>
        </Card>
    );
}
