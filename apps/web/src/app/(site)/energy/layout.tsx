import CurrentMeterNumberCard from "@/components/dashboard/current-meter-number-card";
import CurrentMeterOutCard from "@/components/dashboard/current-meter-out-card";
import CurrentMeterPowerCard from "@/components/dashboard/current-meter-power-card";
import EnergyPageRangeSelector from "@/components/energy/ui/range-selector";
import { getSession } from "@/lib/auth/auth.server";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { redirect } from "next/navigation";
import { Suspense } from "react";

interface Props {
    children: React.ReactNode;
}

export default async function EnergyPageLayout(props: Props) {
    const { user } = await getSession();

    if (!user) {
        redirect("/");
    }

    return (
        <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <h2 className="col-span-1 font-bold text-xl md:col-span-3">Aktuelle Zählerwerte</h2>
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                    <CurrentMeterNumberCard showDescription={false} />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                    <CurrentMeterOutCard showDescription={false} />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                    <CurrentMeterPowerCard showDescription={false} />
                </Suspense>
                <h2 className="col-span-1 mt-8 font-bold text-xl md:col-span-3">Stromdaten Übersicht</h2>
                <EnergyPageRangeSelector />
                {props.children}
            </div>
        </>
    );
}
