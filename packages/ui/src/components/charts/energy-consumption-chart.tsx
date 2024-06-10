"use client";

import { AggregationType, computeTimestampLabel } from "@energyleaf/lib";
import React from "react";
import type { TooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import EnergyConsumptionTooltip from "./energy-consumption-tooltip";
import { LineChart } from "./line-chart";

interface Props {
    data: EnergyData[];
    referencePoints?: {
        data: Record<string, string | number | undefined>[];
        xKeyName: string;
        yKeyName: string;
        callback?: (value: Record<string, string | number | undefined>) => void;
    };
    aggregation?: AggregationType;
    zoomCallback?: (left: Date, right: Date) => void;
}

export type EnergyData = {
    sensorId: string | number;
    energy: number;
    timestamp: string;
    sensorDataId: string;
};

export function EnergyConsumptionChart({ data, referencePoints, aggregation, zoomCallback }: Props) {
    return (
        <LineChart
            data={data}
            keyName="energy"
            referencePoints={referencePoints}
            tooltip={{
                // eslint-disable-next-line react/no-unstable-nested-components -- needs to be a function
                content: (props: TooltipProps<ValueType, NameType>) => {
                    return (
                        <EnergyConsumptionTooltip
                            aggregationType={aggregation ?? AggregationType.RAW}
                            tooltipProps={props}
                        />
                    );
                },
            }}
            xAxes={{ dataKey: "timestamp", name: `Vergangene Zeit ${computeTimestampLabel(aggregation, false)}` }}
            yAxes={{ dataKey: "energy", name: "Energieverbauch in kWh" }}
            zoomCallback={zoomCallback}
        />
    );
}
