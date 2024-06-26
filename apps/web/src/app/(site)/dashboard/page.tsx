import AbsolutEnergyConsumptionCard from "@/components/dashboard/absolut-energy-consumption-card";
import AbsolutEnergyConsumptionError from "@/components/dashboard/absolut-energy-consumption-card-error";
import CurrentMeterNumberCard from "@/components/dashboard/current-meter-number-card";
import CurrentMeterOutCard from "@/components/dashboard/current-meter-out-card";
import CurrentMeterPowerCard from "@/components/dashboard/current-meter-power-card";
import EnergyConsumptionCard from "@/components/dashboard/energy-consumption-card";
import EnergyConsumptionError from "@/components/dashboard/energy-consumption-card-error";
import EnergyConsumptionStatisticCard from "@/components/dashboard/energy-consumption-statistics";
import EnergyConsumptionStatisticsError from "@/components/dashboard/energy-consumption-statistics-error";
import EnergyCostCard from "@/components/dashboard/energy-cost-card";
import EnergyCostError from "@/components/dashboard/energy-cost-card-error";
import GoalsCard from "@/components/dashboard/goals/goals-card";
import GoalsCardError from "@/components/dashboard/goals/goals-card-error";
import { getActionSession } from "@/lib/auth/auth.action";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
import { ErrorBoundary } from "@energyleaf/ui/error";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { Suspense } from "react";

export const metadata = {
    title: "Dashboard | Energyleaf",
};

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: { start?: string; end?: string; aggregation?: string };
}) {
    const { user } = await getActionSession();
    if (!user) {
        return null;
    }

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
            {fulfills(user.appVersion, Versions.self_reflection) && (
                <ErrorBoundary fallback={GoalsCardError}>
                    <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                        <GoalsCard />
                    </Suspense>
                </ErrorBoundary>
            )}
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
                <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                    <CurrentMeterNumberCard />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                    <CurrentMeterOutCard />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                    <CurrentMeterPowerCard />
                </Suspense>
            </div>
            <ErrorBoundary fallback={EnergyConsumptionError}>
                <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                    <EnergyConsumptionCard aggregationType={aggregationType} endDate={endDate} startDate={startDate} />
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}
