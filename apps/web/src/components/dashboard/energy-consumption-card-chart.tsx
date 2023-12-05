"use client";

import { useState } from "react";

import { LineChart } from "@energyleaf/ui/components";

import EnergyConsumptionTooltip from "./energy-consumption-tooltip";
import { EnergyPeakDeviceAssignmentDialog } from "./peaks/energy-peak-device-assignment-dialog";

interface Props {
    data: { id: number, energy: number, timestamp: string | number | undefined }[];
    peaks: { id: number, energy: number, timestamp: string | number | undefined }[];
    devices: { id: number; userId: number; name: string; created: Date | null; }[] | null;
}

export default async function EnergyConsumptionCardChart({ data, peaks, devices }: Props) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<{id: number, energy: number, timestamp: string} | null>(null);

    return (
        <>
            { value && devices ? <EnergyPeakDeviceAssignmentDialog open={open} setOpen={setOpen} value={value} devices={devices}/> : <div/>}
            <LineChart
                data={data}
                keyName="energy"
                referencePoints={{
                    data: peaks,
                    xKeyName: "timestamp",
                    yKeyName: "energy",
                    callback: (callbackData) => {
                        setValue({
                            id: Number(callbackData.id),
                            energy: Number(callbackData.energy),
                            timestamp: callbackData.timestamp?.toString() || "",
                        });
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
