"use client";

import type { SensorDataSelectType, SensorDataSequenceType } from "@energyleaf/db/types";
import type { AggregationType } from "@energyleaf/lib";
import { EnergyConsumptionChart } from "@energyleaf/ui/charts/energy/energy-consumption-chart";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { EnergyPeakDeviceAssignmentDialog } from "./peaks/energy-peak-device-assignment-dialog";

interface Props {
    data: SensorDataSelectType[];
    peaks?: SensorDataSequenceType[];
    aggregation?: AggregationType;
    showPeaks: boolean;
    userId: string;
    cost?: number;
    appVersion: number;
}

export default function EnergyConsumptionCardChart({
    data,
    aggregation,
    userId,
    showPeaks,
    cost,
    peaks,
    appVersion,
}: Props) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<SensorDataSequenceType | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const clickCallback = useCallback((callbackData: SensorDataSequenceType) => {
        setValue(callbackData);
        setOpen(true);
    }, []);

    function handleZoom(left: Date, right: Date) {
        const search = new URLSearchParams();
        searchParams.forEach((v, key) => {
            search.set(key, v);
        });
        search.set("start", left.toISOString());
        search.set("end", right.toISOString());
        router.push(`${pathname}?${search.toString()}`, {
            scroll: false,
        });
    }

    return (
        <>
            {value ? (
                <EnergyPeakDeviceAssignmentDialog
                    open={open}
                    setOpen={setOpen}
                    value={value}
                    userId={userId}
                    appVersion={appVersion}
                />
            ) : null}
            <EnergyConsumptionChart
                data={data}
                peaks={peaks}
                aggregation={aggregation}
                showPeaks={showPeaks}
                cost={cost}
                peaksCallback={clickCallback}
                zoomCallback={handleZoom}
            />
        </>
    );
}
