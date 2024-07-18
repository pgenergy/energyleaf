"use client";

import AverageEnergyCostsDay from "@/components/costs/average-energy-costs-day-card";
import AverageEnergyCostsMonth from "@/components/costs/average-energy-costs-month-card";
import AverageEnergyCostsWeek from "@/components/costs/average-energy-costs-week-card";
import EnergyCostsBarChart from "@/components/costs/energy-costs-bar-chart";
import EnergyCostsChangeLastSevenDays from "@/components/costs/energy-costs-change-last-seven-days-card";
import EnergyCostsChangeLastSevenDaysNationalAverage from "@/components/costs/energy-costs-change-last-seven-days-national-average-card";
import EnergyCostsChangeLastThirtyDays from "@/components/costs/energy-costs-change-last-thirty-days-card";
import EnergyCostsChangeLastThirtyDaysNationalAverage from "@/components/costs/energy-costs-change-last-thirty-days-national-average-card";
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
import EnergyCostsLastSevenDaysError from "@/components/costs/errors/energy-costs-last-seven-days-card-error";
import EnergyCostsLastThirtyDaysError from "@/components/costs/errors/energy-costs-last-thirty-days-card-error";
import EnergyCostsTodayError from "@/components/costs/errors/energy-costs-today-card-error";
import EnergyCostsYesterdayError from "@/components/costs/errors/energy-costs-yesterday-card-error";
import { ErrorBoundary } from "@energyleaf/ui/error";
import { Skeleton } from "@energyleaf/ui/skeleton";
import React, { Suspense } from "react";

const ClientSidePage = ({ userData, energyDataRaw, sensorId }) => {
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
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsChangeLastSevenDays />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsChangeLastThirtyDays />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsChangeLastSevenDaysNationalAverage />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsChangeLastThirtyDaysNationalAverage />
                    </Suspense>
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

            {/* Tägliche Energiekosten Bar Chart */}
            <section>
                <h2 className="mb-4 font-bold text-xl">Tägliche Energiekosten</h2>
                <div className="grid grid-cols-1 gap-4">
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsBarChart energyData={energyDataRaw} userData={userData} />
                    </Suspense>
                </div>
            </section>
        </div>
    );
};

export default ClientSidePage;