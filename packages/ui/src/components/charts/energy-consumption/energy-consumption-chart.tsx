"use client";

import React from "react";
import type { TooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

import { AggregationType, computeTimestampLabel } from "@energyleaf/lib";

import { LineChart } from "../line-chart";
import EnergyConsumptionTooltip from "./energy-consumption-tooltip";

interface Props {
    data: EnergyData[];
    referencePoints?: {
        data: Record<string, string | number | undefined>[];
        xKeyName: string;
        yKeyName: string;
        callback?: (value: Record<string, string | number | undefined>) => void;
    };
    aggregation?: AggregationType;
}

export type EnergyData = {
    sensorId: string | number;
    energy: number;
    timestamp: string;
};

export function EnergyConsumptionChart({ data, referencePoints, aggregation }: Props) {
    return (
        <LineChart
            data={data}
            keyName="energy"
            referencePoints={referencePoints}
            tooltip={{
                content: (props: TooltipProps<ValueType, NameType>) => {
                    return (
                        <EnergyConsumptionTooltip
                            aggregationType={aggregation ?? AggregationType.RAW}
                            tooltipProps={props}
                        />
                    );
                },
            }}
            xAxes={{ dataKey: "timestamp", name: "Vergangene Zeit " + computeTimestampLabel(aggregation, false) }}
            yAxes={{ dataKey: "energy", name: "Energieverbauch in kWh" }}
        />
    );
}
