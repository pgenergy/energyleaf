import { Suspense } from "react";
import AbsolutEnergyConsumptionCard from "@/components/dashboard/absolut-energy-consumption-card";
import EnergyConsumptionCard from "@/components/dashboard/energy-consumption-card";
import EnergyCostCard from "@/components/dashboard/energy-cost-card";
import EnergyStatisticsCard from "@/components/dashboard/energy-consumption-statistics"

import { Skeleton } from "@energyleaf/ui";

export default function DashboardPage({
    searchParams,
}: {
    searchParams: { start?: string; end?: string; aggregation?: string };
}) {
    const startDateString = searchParams.start;
    const endDateString = searchParams.end;
    const aggregationType = searchParams.aggregation;
    const startDate = startDateString ? new Date(startDateString) : new Date();
    const endDate = endDateString ? new Date(endDateString) : new Date();

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                    <AbsolutEnergyConsumptionCard endDate={endDate} startDate={startDate} />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                    <EnergyStatisticsCard endDate={endDate} startDate={startDate} />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                    <EnergyCostCard endDate={endDate} startDate={startDate} />
                </Suspense>
            </div>
            <Suspense fallback={<Skeleton className="h-[57rem] w-full" />}>
                <EnergyConsumptionCard aggregationType={aggregationType} endDate={endDate} startDate={startDate} />
            </Suspense>
        </div>
    );
}
