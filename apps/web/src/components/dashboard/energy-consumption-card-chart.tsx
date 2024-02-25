"use client";

import React, { useCallback, useState } from "react";
import type { Peak, PeakAssignment } from "@/types/peaks/peak";

import { LineChart } from "@energyleaf/ui/components/charts";

import EnergyConsumptionTooltip from "./energy-consumption-tooltip";
import { EnergyPeakDeviceAssignmentDialog } from "./peaks/energy-peak-device-assignment-dialog";
import {AggregationType} from "@energyleaf/db/util";

interface Props {
    data: { sensorId: string | number; energy: number; timestamp: string }[];
    devices: { id: number; userId: number; name: string; created: Date | null }[] | null;
    peaks?: PeakAssignment[];
    aggregation?: string
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
                id: sensorData?.sensorId,
                timestamp: sensorData?.timestamp,
                energy: sensorData?.energy,
                device: peak.device,
            };
        },
        [data],
    );

    const computeTimestampLabel = (aggregationParam) => {
        switch (aggregationParam) {
            case AggregationType.YEAR: return '(in Jahren)';
            case AggregationType.MONTH: return '(in Monaten)';
            case AggregationType.WEEK: return '(in Wochen)';
            case AggregationType.DAY: return '(in Tagen)';
            case AggregationType.HOUR: return '(in Stunden)';
            default: return '(Einheit nicht spezifiziert)';
        }
    };

    return (
        <>
            {value && devices ? (
                <EnergyPeakDeviceAssignmentDialog devices={devices} open={open} setOpen={setOpen} value={value} />
            ) : null}
            <LineChart
                data={data}
                keyName="energy"
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
                tooltip={{
                    content: EnergyConsumptionTooltip,
                }}
                xAxes={{ dataKey: "timestamp", name: "Vergangene Zeit " + computeTimestampLabel(aggregation)}}
                yAxes={{ dataKey: "energy", name: "Energieverbauch in Wh" }}
            />
        </>
    );
}
