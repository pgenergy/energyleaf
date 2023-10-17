import AbsolutEnergyConsumptionCard from "@/components/dashboard/absolut-energy-consumption-card";
import EnergyConsumptionCard from "@/components/dashboard/energy-consumption-card";
import EnergyCostCard from "@/components/dashboard/energy-cost-card";
import { Skeleton } from "@energyleaf/ui";
import { Suspense } from "react";

export default function DashboardPage({ searchParams }: { searchParams: { start?: string; end?: string } }) {
    const startDateString = searchParams.start;
    const endDateString = searchParams.end;
    const startDate = startDateString ? new Date(startDateString) : new Date();
    const endDate = endDateString ? new Date(endDateString) : new Date();

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Suspense fallback={<Skeleton className="w-full h-72" />}>
                    <AbsolutEnergyConsumptionCard endDate={endDate} startDate={startDate} />
                </Suspense>
                <Suspense fallback={<Skeleton className="w-full h-72" />}>
                    <EnergyCostCard endDate={endDate} startDate={startDate} />
                </Suspense>
            </div>
            <Suspense fallback={<Skeleton className="w-full h-[57rem]" />}>
                <EnergyConsumptionCard endDate={endDate} startDate={startDate} />
            </Suspense>
        </div>
    );
}
