import AmortizationCard from "@/components/recommendations/amortization/amortization-card";
import AmortizationCardError from "@/components/recommendations/amortization/amortization-card-error";
import SolarCalculationCard from "@/components/recommendations/solar-calculation-card";
import SolarCalculationCardError from "@/components/recommendations/solar-calculation-card-error";
import { ErrorBoundary } from "@energyleaf/ui/error";
import { Skeleton } from "@energyleaf/ui/skeleton";
import React, { Suspense } from "react";

export const metadata = {
    title: "Empfehlungen | Energyleaf",
};

export default async function RecommendationsPage() {
    return (
        <div className="flex flex-col gap-4">
            <ErrorBoundary fallback={AmortizationCardError}>
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                    <AmortizationCard />
                </Suspense>
            </ErrorBoundary>

            {/* Balkonkraftwerk simulieren */}
            <ErrorBoundary fallback={SolarCalculationCardError}>
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                    <SolarCalculationCard />
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}
