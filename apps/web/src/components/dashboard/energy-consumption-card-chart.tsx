"use client";

import type { AggregationType, ConsumptionData, DeviceClassification } from "@energyleaf/lib";
import { EnergyConsumptionChart } from "@energyleaf/ui/charts/energy-consumption-chart";
import { formatISO } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { EnergyPeakDeviceAssignmentDialog } from "./peaks/energy-peak-device-assignment-dialog";

interface Props {
    data: ConsumptionData[];
    peaks?: ConsumptionData[];
    deviceClassifications?: DeviceClassification[]; // Fügen Sie diese Zeile hinzu
    aggregation: AggregationType;
    userId: string;
}

export default function EnergyConsumptionCardChart({ data, peaks, aggregation, userId }: Props) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<ConsumptionData | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const clickCallback = useCallback(
        (callbackData: {
            sensorId: string;
            energy: number;
            timestamp: string | number | undefined;
            sensorDataId: string;
        }) => {
            setValue({
                sensorId: callbackData.sensorId,
                energy: Number(callbackData.energy),
                timestamp: callbackData.timestamp?.toString() || "",
                sensorDataId: callbackData.sensorDataId,
            });
            setOpen(true);
        },
        [],
    );

    const convertDateFormat = useCallback((dateStr: string) => {
        const cleanedDateStr = dateStr.replace(/\(.+\)$/, "").trim();
        const parsedDate = new Date(cleanedDateStr);
        if (!Number.isNaN(parsedDate.getTime())) {
            return formatISO(parsedDate);
        }
        return dateStr;
    }, []);

    const convertToAxesValue = useCallback(
        (peak: ConsumptionData): Record<string, string | number | undefined> => {
            const sensorData = data.find((x) => x.sensorId === peak.sensorId && x.timestamp === peak.timestamp);

            return {
                sensorId: sensorData?.sensorId ?? "",
                timestamp: sensorData?.timestamp ? convertDateFormat(sensorData.timestamp) : "",
                energy: sensorData?.energy ?? 0,
                sensorDataId: sensorData?.sensorDataId ?? "",
            };
        },
        [data, convertDateFormat],
    );

    function handleZoom(left: Date, right: Date) {
        const search = new URLSearchParams();
        searchParams.forEach((v, key) => {
            search.set(key, v);
        });
        search.set("start", left.toISOString());
        search.set("end", right.toISOString());
        search.set("zoomed", "true");
        router.push(`${pathname}?${search.toString()}`, {
            scroll: false,
        });
    }

    return (
        <>
            {value ? (
                <EnergyPeakDeviceAssignmentDialog open={open} setOpen={setOpen} value={value} userId={userId} />
            ) : null}
            <EnergyConsumptionChart
                aggregation={aggregation}
                data={data.map((d) => ({
                    ...d,
                    timestamp: d.timestamp ? convertDateFormat(d.timestamp) : "",
                }))}
                referencePoints={
                    peaks
                        ? {
                              data: peaks.map(convertToAxesValue),
                              xKeyName: "timestamp",
                              yKeyName: "energy",
                              callback: clickCallback,
                          }
                        : undefined
                }
                zoomCallback={handleZoom}
            />
        </>
    );
}
