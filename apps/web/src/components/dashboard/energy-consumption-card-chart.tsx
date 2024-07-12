"use client";

import type { SensorDataSelectType } from "@energyleaf/db/types";
import type { AggregationType } from "@energyleaf/lib";
import { EnergyConsumptionChart } from "@energyleaf/ui/charts/energy-consumption-chart";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { EnergyPeakDeviceAssignmentDialog } from "./peaks/energy-peak-device-assignment-dialog";

interface Props {
    data: SensorDataSelectType[];
    aggregation?: AggregationType;
    showPeaks: boolean;
    userId: string;
    cost?: number;
}

export default function EnergyConsumptionCardChart({ data, aggregation, userId, showPeaks, cost }: Props) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<SensorDataSelectType | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const clickCallback = useCallback((callbackData: SensorDataSelectType) => {
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
                <EnergyPeakDeviceAssignmentDialog open={open} setOpen={setOpen} value={value} userId={userId} />
            ) : null}
            <EnergyConsumptionChart
                aggregation={aggregation}
                data={data}
                showPeaks={showPeaks}
                cost={cost}
                peaksCallback={clickCallback}
                zoomCallback={handleZoom}
            />
        </>
    );
}
