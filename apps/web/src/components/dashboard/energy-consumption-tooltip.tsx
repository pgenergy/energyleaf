"use client";

import { format } from "date-fns";
import type { TooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

import { Card, CardContent, CardDescription, CardHeader } from "@energyleaf/ui";

export default function EnergyConsumptionTooltip({ payload }: TooltipProps<ValueType, NameType>) {
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

    return (
        <Card className="z-10">
            <CardHeader>
                <CardDescription>{format(new Date(timestamp), "dd.MM.yyyy HH:mm")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <p className="text-sm">
                    <span className="font-bold">Verbrauch:</span> {energy} Wh
                </p>
            </CardContent>
        </Card>
    );
}
