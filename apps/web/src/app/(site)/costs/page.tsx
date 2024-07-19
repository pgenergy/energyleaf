import AverageEnergyCostsDay from "@/components/costs/average-energy-costs-day-card";
import AverageEnergyCostsMonth from "@/components/costs/average-energy-costs-month-card";
import AverageEnergyCostsWeek from "@/components/costs/average-energy-costs-week-card";
import EnergyCostsChangeLastMonth from "@/components/costs/energy-costs-change-last-month-card";
import EnergyCostsChangeLastMonthNationalAverage from "@/components/costs/energy-costs-change-last-month-national-average-card";
import EnergyCostsChangeLastWeek from "@/components/costs/energy-costs-change-last-week-card";
import EnergyCostsChangeLastWeekNationalAverage from "@/components/costs/energy-costs-change-last-week-national-average-card";
import EnergyCostsComparativeProjectionDay from "@/components/costs/energy-costs-comparative-projection-day-card";
import EnergyCostsComparativeProjectionMonth from "@/components/costs/energy-costs-comparative-projection-month-card";
import EnergyCostsComparativeProjectionWeek from "@/components/costs/energy-costs-comparative-projection-week-card";
import EnergyCostsLastSevenDays from "@/components/costs/energy-costs-last-seven-days-card";
import EnergyCostsLastThirtyDays from "@/components/costs/energy-costs-last-thirty-days-card";
import EnergyCostsProjectionMonth from "@/components/costs/energy-costs-projection-this-month-card";
import EnergyCostsProjectionWeek from "@/components/costs/energy-costs-projection-this-week-card";
import EnergyCostsProjectionDay from "@/components/costs/energy-costs-projection-today-card";
import EnergyCostsThriftiestDayLastSevenDays from "@/components/costs/energy-costs-thriftiest-day-last-seven-days-card";
import EnergyCostsThriftiestDayLastThirtyDays from "@/components/costs/energy-costs-thriftiest-day-last-thirty-days-card";
import EnergyCostsToday from "@/components/costs/energy-costs-today-card";
import EnergyCostsYesterday from "@/components/costs/energy-costs-yesterday-card";
import EnergyCostsChangeLastSevenDaysError from "@/components/costs/errors/energy-costs-change-last-seven-days-card-error";
import EnergyCostsChangeLastSevenDaysNationalAverageError from "@/components/costs/errors/energy-costs-change-last-seven-days-national-average-card-error";
import EnergyCostsChangeLastThirtyDaysError from "@/components/costs/errors/energy-costs-change-last-thirty-days-card-error";
import EnergyCostsChangeLastThirtyDaysNationalAverageError from "@/components/costs/errors/energy-costs-change-last-thirty-days-national-average-card-error";
import EnergyCostsLastSevenDaysError from "@/components/costs/errors/energy-costs-last-seven-days-card-error";
import EnergyCostsLastThirtyDaysError from "@/components/costs/errors/energy-costs-last-thirty-days-card-error";
import EnergyCostsTodayError from "@/components/costs/errors/energy-costs-today-card-error";
import EnergyCostsYesterdayError from "@/components/costs/errors/energy-costs-yesterday-card-error";
import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { getUserDataHistory } from "@/query/user";
import { ErrorBoundary } from "@energyleaf/ui/error";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { redirect } from "next/navigation";
import type React from "react";
import { Suspense } from "react";

export const metadata = {
    title: "Kosten | Energyleaf",
};

export default async function CostsPage() {
    const { session, user } = await getSession();

    if (!session) {
        redirect("/");
    }

    const userId = user.id;
    const sensorId = await getElectricitySensorIdForUser(userId);
    if (!sensorId) {
        redirect("/");
    }

    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() - 2;
    if (month < 0) {
        month += 12;
        year -= 1;
    }

    const startDate = new Date(year, month, 1);
    const endDate = now;

    const energyDataRaw = await getEnergyDataForSensor(startDate, endDate, sensorId);
    const userData = await getUserDataHistory(userId);

    return (
        <div className="flex flex-col gap-4">
            <h1 className="font-bold text-2xl">Kosten-Übersichten</h1>

            {/* Absolute Energiekosten */}
            <section>
                <h2 className="mb-4 font-bold text-xl">Absolute Energiekosten</h2>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 md:grid-cols-2">
                    <ErrorBoundary fallback={EnergyCostsTodayError}>
                        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                            <EnergyCostsToday userData={userData} energyDataRaw={energyDataRaw} />
                        </Suspense>
                    </ErrorBoundary>
                    <ErrorBoundary fallback={EnergyCostsYesterdayError}>
                        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                            <EnergyCostsYesterday userData={userData} energyDataRaw={energyDataRaw} />
                        </Suspense>
                    </ErrorBoundary>
                    <ErrorBoundary fallback={EnergyCostsLastSevenDaysError}>
                        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                            <EnergyCostsLastSevenDays userData={userData} energyDataRaw={energyDataRaw} />
                        </Suspense>
                    </ErrorBoundary>
                    <ErrorBoundary fallback={EnergyCostsLastThirtyDaysError}>
                        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                            <EnergyCostsLastThirtyDays userData={userData} energyDataRaw={energyDataRaw} />
                        </Suspense>
                    </ErrorBoundary>
                </div>
            </section>

            {/* Durchschnittliche Energiekosten */}
            <section>
                <h2 className="mb-4 font-bold text-xl">Durchschnittliche Energiekosten</h2>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 md:grid-cols-2">
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <AverageEnergyCostsDay userData={userData} energyData={energyDataRaw} />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <AverageEnergyCostsWeek userData={userData} energyData={energyDataRaw} />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <AverageEnergyCostsMonth userData={userData} energyData={energyDataRaw} />
                    </Suspense>
                </div>
            </section>

            {/* Sparsamkeitsübersicht */}
            <section>
                <h2 className="mb-4 font-bold text-xl">Sparsamkeitsübersicht</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsThriftiestDayLastSevenDays userData={userData} energyData={energyDataRaw} />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsThriftiestDayLastThirtyDays userData={userData} energyData={energyDataRaw} />
                    </Suspense>
                </div>
            </section>

            {/* Energiekosten Vergleiche */}
            <section>
                <h2 className="mb-4 font-bold text-xl">Energiekosten Vergleiche</h2>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 md:grid-cols-2">
                    <ErrorBoundary fallback={EnergyCostsChangeLastSevenDaysError}>
                        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                            <EnergyCostsChangeLastWeek userData={userData} energyData={energyDataRaw} />
                        </Suspense>
                    </ErrorBoundary>
                    <ErrorBoundary fallback={EnergyCostsChangeLastThirtyDaysError}>
                        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                            <EnergyCostsChangeLastMonth userData={userData} energyData={energyDataRaw} />
                        </Suspense>
                    </ErrorBoundary>
                    <ErrorBoundary fallback={EnergyCostsChangeLastSevenDaysNationalAverageError}>
                        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                            <EnergyCostsChangeLastWeekNationalAverage userData={userData} energyData={energyDataRaw} />
                        </Suspense>
                    </ErrorBoundary>
                    <ErrorBoundary fallback={EnergyCostsChangeLastThirtyDaysNationalAverageError}>
                        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                            <EnergyCostsChangeLastMonthNationalAverage userData={userData} energyData={energyDataRaw} />
                        </Suspense>
                    </ErrorBoundary>
                </div>
            </section>

            {/* Hochrechnungen */}
            <section>
                <h2 className="mb-4 font-bold text-xl">Hochrechnungen</h2>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 md:grid-cols-2">
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsProjectionDay userData={userData} energyData={energyDataRaw} />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsProjectionWeek userData={userData} energyData={energyDataRaw} />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsProjectionMonth userData={userData} energyData={energyDataRaw} />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsComparativeProjectionDay userData={userData} energyData={energyDataRaw} />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsComparativeProjectionWeek userData={userData} energyData={energyDataRaw} />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsComparativeProjectionMonth userData={userData} energyData={energyDataRaw} />
                    </Suspense>
                </div>
            </section>
        </div>
    );
}
