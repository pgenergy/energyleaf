"use client";

import React, { useCallback, useState } from "react";
import type { Peak, PeakAssignment } from "@/types/consumption/peak";

import { EnergyPeakDeviceAssignmentDialog } from "./peaks/energy-peak-device-assignment-dialog";
import {EnergyConsumptionChart, type EnergyData} from "@energyleaf/ui/components/charts";
import type {DeviceSelectType} from "@energyleaf/db/types";
import type {AggregationType} from "@energyleaf/lib";

interface Props {
    data: EnergyData[];
    devices: DeviceSelectType[] | null;
    peaks?: PeakAssignment[];
    aggregation?: AggregationType;
}

export default function EnergyConsumptionCardChart({ data, peaks, devices, aggregation }: Props) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<Peak | null>(null);

    const clickCallback = useCallback(
        (callbackData: { id: string; energy: number; timestamp: string | number | undefined; device?: number }) => {
            setValue({
                sensorId: callbackData.id,
                energy: Number(callbackData.energy),
                timestamp: callbackData.timestamp?.toString() || "",
                device: callbackData.device ? Number(callbackData.device) : undefined,
            });
            setOpen(true);
        },
        [setValue, setOpen],
    );
    const onClick = devices && devices.length > 0 ? clickCallback : undefined;

    const convertToAxesValue = useCallback(
        (peak: Peak): Record<string, string | number | undefined> => {
            const sensorData = data.find((x) => x.sensorId === peak.sensorId && x.timestamp === peak.timestamp);

            return {
                sensorId: sensorData?.sensorId ?? "",
                timestamp: sensorData?.timestamp || "",
                energy: sensorData?.energy ?? 0,
                device: peak.device,
            };
        },
        [data],
    );

    return (
        <>
            {value && devices ? (
                <EnergyPeakDeviceAssignmentDialog devices={devices} open={open} setOpen={setOpen} value={value} />
            ) : null}
            <EnergyConsumptionChart
                aggregation={aggregation}
                data={data}
                referencePoints={
                    peaks
                        ? {
                              data: peaks.map(convertToAxesValue),
                              xKeyName: "timestamp",
                              yKeyName: "energy",
                              callback: onClick,
                          }
                        : undefined
                }
            />
        </>
    );
}
