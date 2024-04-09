import { Suspense } from "react";
import AbsolutEnergyConsumptionCard from "@/components/dashboard/absolut-energy-consumption-card";
import AbsolutEnergyConsumptionError from "@/components/dashboard/absolut-energy-consumption-card-error";
import EnergyConsumptionCard from "@/components/dashboard/energy-consumption-card";
import EnergyConsumptionError from "@/components/dashboard/energy-consumption-card-error";
import EnergyConsumptionStatisticCard from "@/components/dashboard/energy-consumption-statistics";
import EnergyConsumptionStatisticsError from "@/components/dashboard/energy-consumption-statistics-error";
import EnergyCostCard from "@/components/dashboard/energy-cost-card";
import EnergyCostError from "@/components/dashboard/energy-cost-card-error";
import GoalsCard from "@/components/dashboard/goals/goals-card";
import GoalsCardError from "@/components/dashboard/goals/goals-card-error";

import { Skeleton } from "@energyleaf/ui";
import { ErrorBoundary } from "@energyleaf/ui/error";

export const metadata = {
    title: "Dashboard | Energyleaf",
};

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

    if (!startDateString) {
        startDate.setHours(0, 0, 0, 0);
    }

    if (!endDateString) {
        endDate.setHours(23, 59, 59, 999);
    }

    return (
        <div className="flex flex-col gap-4">
            <ErrorBoundary fallback={GoalsCardError}>
                <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                    <GoalsCard />
                </Suspense>
            </ErrorBoundary>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <ErrorBoundary fallback={AbsolutEnergyConsumptionError}>
                    <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                        <AbsolutEnergyConsumptionCard endDate={endDate} startDate={startDate} />
                    </Suspense>
                </ErrorBoundary>
                <ErrorBoundary fallback={EnergyConsumptionStatisticsError}>
                    <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                        <EnergyConsumptionStatisticCard endDate={endDate} startDate={startDate} />
                    </Suspense>
                </ErrorBoundary>
                <ErrorBoundary fallback={EnergyCostError}>
                    <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                        <EnergyCostCard endDate={endDate} startDate={startDate} />
                    </Suspense>
                </ErrorBoundary>
            </div>
            <ErrorBoundary fallback={EnergyConsumptionError}>
                <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                    <EnergyConsumptionCard aggregationType={aggregationType} endDate={endDate} startDate={startDate} />
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}
