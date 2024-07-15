import CurrentMeterNumberCard from "@/components/dashboard/current-meter-number-card";
import CurrentMeterOutCard from "@/components/dashboard/current-meter-out-card";
import CurrentMeterPowerCard from "@/components/dashboard/current-meter-power-card";
import EnergyPageRangeSelector from "@/components/dashboard/energy/range-selector";
import EnergyPageMonthView from "@/components/energy/views/month-view";
import EnergyPageTodayView from "@/components/energy/views/today-view";
import EnergyPageWeekView from "@/components/energy/views/week-view";
import EnergyPageYesterdayView from "@/components/energy/views/yesterday-view";
import { getSession } from "@/lib/auth/auth.server";
import type { EnergyRangeOptionType } from "@/types/energy";
import { fulfills, Versions } from "@energyleaf/lib/versioning";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { redirect } from "next/navigation";
import { Suspense } from "react";

interface Props {
    searchParams: {
        range: EnergyRangeOptionType | undefined;
    };
}

export default async function EnergyPage(props: Props) {
    const { user } = await getSession();

    if (!user) {
        redirect("/");
    }

    return (
        <>
            <h1 className="pb-4 font-bold text-2xl">Strom Übersicht</h1>
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
                <EnergyPageRangeSelector range={props.searchParams.range || "today"} />
                {props.searchParams.range === "today" || !props.searchParams.range ? <EnergyPageTodayView /> : null}
                {props.searchParams.range === "yesterday" ? <EnergyPageYesterdayView /> : null}
                {props.searchParams.range === "week" ? <EnergyPageWeekView /> : null}
                {props.searchParams.range === "month" ? <EnergyPageMonthView /> : null}
                <h2 className="col-span-1 font-bold text-xl md:col-span-3">Tage vergleichen</h2>
                {fulfills(user.appVersion, Versions.self_reflection) ? (
                    <h2 className="col-span-1 font-bold text-xl md:col-span-3">Was war an diesem Tag?</h2>
                ) : null}
            </div>
        </>
    );
}
