import { Suspense } from "react";
import EnergyConsumptionCard from "@/components/dashboard/energy-consumption-card";

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
            <Suspense fallback={<Skeleton className="h-[57rem] w-full" />}>
                <EnergyConsumptionCard aggregationType={aggregationType} endDate={endDate} startDate={startDate} />
            </Suspense>
        </div>
    );
}
