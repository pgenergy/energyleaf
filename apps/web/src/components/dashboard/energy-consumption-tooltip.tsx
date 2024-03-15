"use client";

import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { TooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

import { AggregationType } from "@energyleaf/db/util";
import { Card, CardContent, CardDescription, CardHeader } from "@energyleaf/ui";
import {computeTimestampLabel} from "@/components/dashboard/utils";

export default function EnergyConsumptionTooltip({ payload }: TooltipProps<ValueType, NameType>) {
    const searchParams = useSearchParams();
    let aggregation = AggregationType.RAW;
    const aggregationType = searchParams.get("aggregation");
    if (aggregationType) {
        aggregation = AggregationType[aggregationType.toUpperCase() as keyof typeof AggregationType];
    }

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

    const formatedTimestamp = () => {
        if (aggregation === AggregationType.RAW) {
            return format(new Date(timestamp), "dd.MM.yyyy HH:mm");
        }

        if (aggregation === AggregationType.HOUR) {
            return `${format(new Date(timestamp), "HH")} Uhr`;
        }

        if (aggregation === AggregationType.DAY) {
            return `Tag: ${format(new Date(timestamp), "dd")}`;
        }

        if (aggregation === AggregationType.MONTH) {
            return `Monat: ${format(new Date(timestamp), "MMMM", {
                locale: de,
            })}`;
        }

        if (aggregation === AggregationType.YEAR) {
            return `Jahr: ${format(new Date(timestamp), "yyyy")}`;
        }
    };

    return (
        <Card className="z-10">
            <CardHeader>
                <CardDescription>{formatedTimestamp()}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <p className="text-sm">
                    <span className="font-bold">Verbrauch:</span> {energy.toFixed(2)} {computeTimestampLabel(aggregation, false)}
                </p>
            </CardContent>
        </Card>
    );
}
