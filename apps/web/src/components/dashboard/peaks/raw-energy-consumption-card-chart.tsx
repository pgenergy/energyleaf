"use client";

import { AggregationType } from "@/lib/aggregation-type";
import { useState } from "react";
import EnergyConsumptionTooltip from "../energy-consumption-tooltip";
import { LineChart } from "@energyleaf/ui/components";
import { EnergyPeakDeviceAssignmentDialog } from "./energy-peak-device-assignment-dialog";
import EnergyConsumptionCardChart from "../energy-consumption-card-chart";

interface Props {
    data: { id: number, energy: number, timestamp: string | number | undefined }[];
    peaks: { id: number, energy: number, timestamp: string | number | undefined, device?: number }[];
    devices: { id: number; userId: number; name: string; created: Date | null; }[] | null;
}

/**
 * Chart for {@link AggregationType.Raw}. Unlike {@link EnergyConsumptionCardChart}, this chart provides further
 * functionality, i.e. displaying peaks and the ability to assign a device to a peak.
 */
export default function RawEnergyConsumptionCardChart({ data, peaks, devices }: Props) {
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
            <EnergyConsumptionCardChart 
                data={data} 
                referencePoints={{
                    data: peaks,
                    xKeyName: "timestamp",
                    yKeyName: "energy",
                    callback: clickCallback,
                }}/>
        </>
    );
}