"use client";

import { LineChart } from "@energyleaf/ui/components";
import EnergyConsumptionTooltip from "./energy-consumption-tooltip";

interface Props {
    data: Record<string, string | number | Date | null>[];
    peaks: Record<string, string | number | Date | null>[];
};

export default function EnergyConsumptionCardChart({ data, peaks }: Props) {
    return (
        <LineChart
            data={data}
            keyName="energy"
            referencePoints={{
                data: peaks,
                xKeyName: "timestamp",
                yKeyName: "energy",
            }}
            tooltip={{
                content: EnergyConsumptionTooltip,
            }}
            xAxes={{ dataKey: "timestamp" }}
            yAxes={{ dataKey: "energy", name: "Energieverbauch in Wh" }}
        />
    );
}
