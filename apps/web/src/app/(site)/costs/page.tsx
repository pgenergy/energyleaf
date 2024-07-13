import React, { Suspense } from 'react';
import { Skeleton } from '@energyleaf/ui/skeleton';
import EnergyCostsToday from '@/components/costs/energy-costs-today-card';
import EnergyCostsYesterday from '@/components/costs/energy-costs-yesterday-card';
import EnergyCostsLastSevenDays from '@/components/costs/energy-costs-last-seven-days-card';
import EnergyCostsLastThirtyDays from '@/components/costs/energy-costs-last-thirty-days-card';
import AverageEnergyCostsWeek from '@/components/costs/average-energy-costs-week-card';
import AverageEnergyCostsDay from '@/components/costs/average-energy-costs-day-card';
import AverageEnergyCostsMonth from '@/components/costs/average-energy-costs-month-card';
import EnergyCostsThriftiestDayLastSevenDays from '@/components/costs/energy-costs-thriftiest-day-last-seven-days-card';
import EnergyCostsThriftiestDayLastThirtyDays from '@/components/costs/energy-costs-thriftiest-day-last-thirty-days-card';
import EnergyCostsChangeLastSevenDays from '@/components/costs/energy-costs-change-last-seven-days-card';
import EnergyCostsChangeLastThirtyDays from '@/components/costs/energy-costs-change-last-thirty-days-card';
import EnergyCostsChangeLastSevenDaysNationalAverage from '@/components/costs/energy-costs-change-last-seven-days-national-average-card';
import EnergyCostsChangeLastThirtyDaysNationalAverage from '@/components/costs/energy-costs-change-last-thirty-days-national-average-card';
import EnergyCostsProjectionDay from '@/components/costs/energy-costs-projection-today-card';
import EnergyCostsProjectionWeek from '@/components/costs/energy-costs-projection-this-week-card';
import EnergyCostsProjectionMonth from '@/components/costs/energy-costs-projection-this-month-card';
import EnergyCostsComparativeProjectionDay from '@/components/costs/energy-costs-comparative-projection-day-card';
import EnergyCostsComparativeProjectionWeek from '@/components/costs/energy-costs-comparative-projection-week-card';
import EnergyCostsComparativeProjectionMonth from '@/components/costs/energy-costs-comparative-projection-month-card';

export const metadata = {
    title: "Kosten | Energyleaf",
};

export default function CostsPage() {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="font-bold text-2xl">Kosten-Übersichten</h1>

            {/* Absolute Energiekosten */}
            <section>
                <h2 className="font-bold text-xl mb-4">Absolute Energiekosten</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsToday />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsYesterday />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsLastSevenDays />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsLastThirtyDays />
                    </Suspense>
                </div>
            </section>

            {/* Durchschnittliche Energiekosten */}
            <section>
                <h2 className="font-bold text-xl mb-4">Durchschnittliche Energiekosten</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <AverageEnergyCostsDay />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <AverageEnergyCostsWeek />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <AverageEnergyCostsMonth />
                    </Suspense>
                </div>
            </section>

            {/* Sparsamkeitsübersicht */}
            <section>
                <h2 className="font-bold text-xl mb-4">Sparsamkeitsübersicht</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsThriftiestDayLastSevenDays />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsThriftiestDayLastThirtyDays />
                    </Suspense>
                </div>
            </section>

            {/* Energiekosten Vergleiche */}
            <section>
                <h2 className="font-bold text-xl mb-4">Energiekosten Vergleiche</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <h2 className="font-bold text-xl mb-4">Hochrechnungen</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsProjectionDay />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsProjectionWeek />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsProjectionMonth />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsComparativeProjectionDay />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsComparativeProjectionWeek />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <EnergyCostsComparativeProjectionMonth />
                    </Suspense>
                </div>
            </section>
        </div>
    );
}
