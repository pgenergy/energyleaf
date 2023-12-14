"use client";

import { useState } from "react";

import { LineChart } from "@energyleaf/ui/components";

import EnergyConsumptionTooltip from "./energy-consumption-tooltip";
import { EnergyPeakDeviceAssignmentDialog } from "./energy-peak-device-assignment-dialog";

interface Props {
    data: Record<string, string | number | undefined>[];
    peaks: Record<string, string | number | undefined>[];
    devices: { id: number; userId: number; name: string; created: Date | null; }[] | null;
}

export default async function EnergyConsumptionCardChart({ data, peaks, devices }: Props) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<Record<string, string | number | undefined>>({});
    const [deviceKey, setDeviceKey] = useState<string>("");

    return (
        <>
            <EnergyPeakDeviceAssignmentDialog open={open} setOpen={setOpen} value={value} devices={devices}/>
            <LineChart
                data={data}
                keyName="energy"
                referencePoints={{
                    data: peaks,
                    xKeyName: "timestamp",
                    yKeyName: "energy",
                    callback: (callbackData) => {
                        setValue(callbackData);
                        setOpen(true);
                    },
                }}
                tooltip={{
                    content: EnergyConsumptionTooltip,
                }}
                xAxes={{ dataKey: "timestamp" }}
                yAxes={{ dataKey: "energy", name: "Energieverbauch in Wh" }}
            />
        </>
    );
}
