import AbsolutEnergyConsumptionCard from "@/components/dashboard/absolut-energy-consumption-card";
import AbsolutEnergyConsumptionError from "@/components/dashboard/absolut-energy-consumption-card-error";
import CurrentMeterNumberCard from "@/components/dashboard/current-meter-number-card";
import CurrentMeterOutCard from "@/components/dashboard/current-meter-out-card";
import CurrentMeterPowerCard from "@/components/dashboard/current-meter-power-card";
import DashboardDateRange from "@/components/dashboard/dashboard-date-range";
import DashboardTimeRange from "@/components/dashboard/dashboard-time-range";
import EnergyConsumptionCard from "@/components/dashboard/energy-consumption-card";
import EnergyConsumptionError from "@/components/dashboard/energy-consumption-card-error";
import EnergyCostCard from "@/components/dashboard/energy-cost-card";
import EnergyCostError from "@/components/dashboard/energy-cost-card-error";
import GoalsCard from "@/components/dashboard/goals/goals-card";
import GoalsCardError from "@/components/dashboard/goals/goals-card-error";
import { getSession } from "@/lib/auth/auth.server";
import { UTCDate } from "@date-fns/utc";
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
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    const startDateString = searchParams.start;
    const endDateString = searchParams.end;
    const aggregationType = searchParams.aggregation;
    const startDate = startDateString ? new Date(startDateString) : new UTCDate();
    const endDate = endDateString ? new Date(endDateString) : new UTCDate();

    if (!startDateString) {
        startDate.setUTCHours(0, 0, 0, 0);
    }

    if (!endDateString) {
        endDate.setUTCHours(23, 59, 59, 999);
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="col-span-1 md:col-span-3">
                    <h1 className="font-bold text-2xl">Übersicht</h1>
                </div>
                {fulfills(user.appVersion, Versions.self_reflection) && (
                    <ErrorBoundary fallback={GoalsCardError}>
                        <Suspense fallback={<Skeleton className="col-span-1 h-72 w-full md:col-span-3" />}>
                            <GoalsCard />
                        </Suspense>
                    </ErrorBoundary>
                )}
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                    <CurrentMeterNumberCard />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                    <CurrentMeterOutCard />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                    <CurrentMeterPowerCard />
                </Suspense>
                <div className="col-span-1 mt-8 flex flex-col gap-4 md:col-span-3 md:mt-16">
                    <h1 className="font-bold text-2xl">Werte im Zeitraum</h1>
                    <div className="flex flex-col gap-2 md:flex-row">
                        {user.id !== "demo" ? <DashboardDateRange endDate={endDate} startDate={startDate} /> : null}
                        <DashboardTimeRange startDate={startDate} endDate={endDate} />
                    </div>
                </div>
                <ErrorBoundary fallback={AbsolutEnergyConsumptionError}>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <AbsolutEnergyConsumptionCard endDate={endDate} startDate={startDate} />
                    </Suspense>
                </ErrorBoundary>
                <ErrorBoundary fallback={EnergyCostError}>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostCard endDate={endDate} startDate={startDate} />
                    </Suspense>
                </ErrorBoundary>
            </div>
            <ErrorBoundary fallback={EnergyConsumptionError}>
                <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                    <EnergyConsumptionCard aggregationType={aggregationType} endDate={endDate} startDate={startDate} />
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}
