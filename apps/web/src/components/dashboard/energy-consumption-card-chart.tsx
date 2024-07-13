"use client";

import type { AggregationType, ConsumptionData, Peak } from "@energyleaf/lib";
import { EnergyConsumptionChart } from "@energyleaf/ui/charts/energy-consumption-chart";
import { formatISO } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { EnergyPeakDeviceAssignmentDialog } from "./peaks/energy-peak-device-assignment-dialog";

interface Props {
    data: ConsumptionData[];
    peaks?: Peak[];
    aggregation?: AggregationType;
    userId: string;
}

export default function EnergyConsumptionCardChart({ data, peaks, aggregation, userId }: Props) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<Peak | null>(null);
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
            // TODO: Assign peak to value
            // setValue({
            //     sensorId: callbackData.sensorId,
            //     energy: Number(callbackData.energy),
            //     timestamp: callbackData.timestamp?.toString() || "",
            //     sensorDataId: callbackData.sensorDataId,
            // });
            setOpen(true);
        },
        [],
    );

    const convertToAxesValue = useCallback(
        (peak: ConsumptionData): Record<string, string | number | undefined> => {
            const sensorData = data.find((x) => x.sensorId === peak.sensorId && x.timestamp === peak.timestamp);

            return {
                sensorId: sensorData?.sensorId ?? "",
                timestamp: sensorData?.timestamp ? sensorData.timestamp : "",
                energy: sensorData?.energy ?? 0,
                sensorDataId: sensorData?.sensorDataId ?? "",
            };
        },
        [data],
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
                    timestamp: d.timestamp ? d.timestamp : "",
                }))}
                // TODO: Add peaks to chart
                // referencePoints={
                //     peaks
                //         ? {
                //               data: peaks.map(convertToAxesValue),
                //               xKeyName: "timestamp",
                //               yKeyName: "energy",
                //               callback: clickCallback,
                //           }
                //         : undefined
                // }
                zoomCallback={handleZoom}
            />
        </>
    );
}
