"use client";

import {LineChart} from "../line-chart";
import React from "react";
import EnergyConsumptionTooltip from "./energy-consumption-tooltip";

interface Props {
    data: { sensorId: string | number; energy: number; timestamp: string }[];
    referencePoints?: {
        data: Record<string, string | number | undefined>[];
        xKeyName: string;
        yKeyName: string;
        callback?: (value: Record<string, string | number | undefined>) => void;
    };
}

export function EnergyConsumptionChart({ data, referencePoints }: Props) {
    return <LineChart
        data={data}
        keyName="energy"
        referencePoints={referencePoints}
        tooltip={{
            content: EnergyConsumptionTooltip,
        }}
        xAxes={{ dataKey: "timestamp" }}
        yAxes={{ dataKey: "energy", name: "Energieverbauch in Wh" }}
    />
}