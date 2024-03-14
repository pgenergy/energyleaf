"use client";

import React, { useCallback, useState } from "react";
import type { Peak, PeakAssignment } from "@/types/consumption/peak";
import { LineChart } from "@energyleaf/ui/components/charts";
import EnergyConsumptionTooltip from "./energy-consumption-tooltip";
import { EnergyPeakDeviceAssignmentDialog } from "./peaks/energy-peak-device-assignment-dialog";
import { formatISO } from "date-fns";

interface Props {
    data: { sensorId: string | number; energy: number; timestamp: string }[];
    devices: { id: number; userId: number; name: string; created: Date | null }[] | null;
    peaks?: PeakAssignment[];
}

export default function EnergyConsumptionCardChart({ data, peaks, devices }: Props) {
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

    const convertDateFormat = useCallback((dateStr) => {
        // Entfernen Sie den Teil mit der benannten Zeitzone, um Kompatibilitätsprobleme zu vermeiden
        const cleanedDateStr = dateStr.replace(/\(.+\)$/, "").trim();
        // Erstellen Sie ein Date-Objekt aus dem bereinigten String
        const parsedDate = new Date(cleanedDateStr);
        // Überprüfen Sie, ob das Date-Objekt gültig ist, indem Sie isNaN auf dessen Zeit überprüfen
        if (!isNaN(parsedDate.getTime())) {
            // Verwenden Sie formatISO, um das Date-Objekt in einen ISO-String zu konvertieren
            return formatISO(parsedDate);
        } else {
            console.error("Ungültiges Datum: ", dateStr);
            return dateStr; // Rückgabe des Original-Strings bei Fehlern
        }
    }, []); 

    const convertToAxesValue = useCallback(
        (peak: Peak): Record<string, string | number | undefined> => {
            const sensorData = data.find((x) => x.sensorId === peak.sensorId && x.timestamp === peak.timestamp);

            return {
                id: sensorData?.sensorId,
                timestamp: sensorData?.timestamp ? convertDateFormat(sensorData.timestamp) : undefined,
                energy: sensorData?.energy,
                device: peak.device,
            };
        },
        [data, convertDateFormat],
    );

    return (
        <>
            {value && devices ? (
                <EnergyPeakDeviceAssignmentDialog devices={devices} open={open} setOpen={setOpen} value={value} />
            ) : null}
            <LineChart
                data={data.map(d => ({ ...d, timestamp: d.timestamp ? convertDateFormat(d.timestamp) : undefined }))}
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
                xAxes={{ dataKey: "timestamp" }}
                yAxes={{ dataKey: "energy", name: "Energieverbrauch in Wh" }}
            />
        </>
    );
}
