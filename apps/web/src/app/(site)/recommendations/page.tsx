import AmortizationCard from "@/components/recommendations/amortization/amortization-card";
import AmortizationCardError from "@/components/recommendations/amortization/amortization-card-error";
import EnergyTipsCard from "@/components/recommendations/tips/energy-tips-card";
import EnergyTipsCardError from "@/components/recommendations/tips/energy-tips-card-error";
import { ErrorBoundary } from "@energyleaf/ui/error";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { Suspense } from "react";

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
            <ErrorBoundary fallback={EnergyTipsCardError}>
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                    <EnergyTipsCard />
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}
