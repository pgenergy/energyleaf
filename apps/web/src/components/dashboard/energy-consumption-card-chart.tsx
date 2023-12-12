"use client";

import { useState } from "react";

import { LineChart } from "@energyleaf/ui/components";

import EnergyConsumptionTooltip from "./energy-consumption-tooltip";
import { EnergyPeakDeviceAssignmentDialog } from "./peaks/energy-peak-device-assignment-dialog";

interface Props {
    data: { id: number, energy: number, timestamp: string | number | undefined }[];
    peaks: { id: number, energy: number, timestamp: string | number | undefined, device?: number }[];
    devices: { id: number; userId: number; name: string; created: Date | null; }[] | null;
}

export default async function EnergyConsumptionCardChart({ data, peaks, devices }: Props) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<{id: number, energy: number, timestamp: string, device?: number} | null>(null);

    function onClick(callbackData: { id: number, energy: number, timestamp: string | number | undefined, device?: number }) {
        setValue({
            id: Number(callbackData.id),
            energy: Number(callbackData.energy),
            timestamp: callbackData.timestamp?.toString() || "",
            device: callbackData.device ? Number(callbackData.device) : undefined
        });
        setOpen(true);
    }
    const clickCallback = devices ? onClick : undefined;

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
                    callback: clickCallback,
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
