'use client';

import { useCallback, useMemo, useState } from "react";
import { EnergyPeakDeviceAssignmentDialog } from "./energy-peak-device-assignment-dialog";
import EnergyConsumptionCardChart from "../energy-consumption-card-chart";
import React from "react";

interface Props {
    data: { id: number, energy: number, timestamp: string }[];
    peaks: PeakAssignment[];
    devices: { id: number; userId: number; name: string; created: Date | null; }[] | null;
}


/**
 * Chart for {@link AggregationType.Raw}. Unlike {@link EnergyConsumptionCardChart}, this chart provides further
 * functionality, i.e. displaying peaks and the ability to assign a device to a peak.
 */
export default function RawEnergyConsumptionCardChart({ data, peaks, devices }: Props) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<Peak | null>(null);

    const onClick = (devices && devices.length > 0) ? useCallback((callbackData: { id: number, energy: number, timestamp: string | number | undefined, device?: number }) => {
        setValue({
            id: Number(callbackData.id),
            energy: Number(callbackData.energy),
            timestamp: callbackData.timestamp?.toString() || "",
            device: callbackData.device ? Number(callbackData.device) : undefined
        });
        setOpen(true);
    }, [setValue, setOpen]) : undefined;

    const convertToAxesValue = (peak: Peak): Record<string, string | number | undefined> => {
        const sensorData = data.find(x => x.id === peak.id);
    
        return {
            timestamp: sensorData?.timestamp,
            energy: sensorData?.energy,
            id: peak.id,
            device: peak.device
        };
    };

    const consumptionChart = useMemo(() => (
        <EnergyConsumptionCardChart 
            data={data} 
            referencePoints={{
                data: peaks.map(convertToAxesValue),
                xKeyName: "timestamp",
                yKeyName: "energy",
                callback: onClick
            }}/>
    ), [data, peaks, onClick]);

    return (
        <>
            { value && devices ? <EnergyPeakDeviceAssignmentDialog open={open} setOpen={setOpen} value={value} devices={devices}/> : null}
            { consumptionChart }
        </>
    );
}