import CurrentMeterNumberCard from "@/components/dashboard/current-meter-number-card";
import CurrentMeterOutCard from "@/components/dashboard/current-meter-out-card";
import CurrentMeterPowerCard from "@/components/dashboard/current-meter-power-card";
import EnergyPageRangeSelector from "@/components/dashboard/energy/range-selector";
import type { EnergyRangeOptionType } from "@/types/energy";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { Suspense } from "react";

interface Props {
    params: {
        range: EnergyRangeOptionType | undefined;
    },
};

export default function EnergyPage(props: Props) {
    return (
        <>
            <h1 className="pb-4 font-bold text-2xl">Strom Übersicht</h1>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <h2 className="col-span-1 font-bold text-xl md:col-span-3">
                    Aktuelle Zählerwerte
                </h2>
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                    <CurrentMeterNumberCard showDescription={false} />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                    <CurrentMeterOutCard showDescription={false} />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                    <CurrentMeterPowerCard showDescription={false} />
                </Suspense>
                <EnergyPageRangeSelector range={props.params.range || "today"} />
            </div>
        </>
    );
}
