"use client";

import { LineChart } from "@energyleaf/ui/components";

import EnergyConsumptionTooltip from "./energy-consumption-tooltip";

type AxesValue = string | number | undefined;

interface Props {
    data: Record<string, AxesValue>[];
    referencePoints?: {
        data: Record<string, AxesValue>[];
        xKeyName: string;
        yKeyName: string;
        callback?: (value: Record<string, AxesValue>) => void;
    };
}

export default function EnergyConsumptionCardChart({ data, referencePoints }: Props) {
    return (
        <LineChart
            data={data}
            keyName="energy"
            referencePoints={referencePoints}
            tooltip={{
                content: EnergyConsumptionTooltip,
            }}
            xAxes={{ dataKey: "timestamp" }}
            yAxes={{ dataKey: "energy", name: "Energieverbauch in Wh" }}
        />
    );
}
