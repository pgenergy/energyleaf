import AmortizationCard from "@/components/recommendations/amortization-card";
import AvgEnergyConsumptionCard from "@/components/recommendations/avg-energy-consumption-card";
import AvgEnergyConsumptionError from "@/components/recommendations/avg-energy-consumption-card-error";
import AvgEnergyConsumptionComparisonCard from "@/components/recommendations/avg-energy-consumption-comparison";
import AvgEnergyConsumptionComparisonError from "@/components/recommendations/avg-energy-consumption-comparison-error";
import { ErrorBoundary } from "@energyleaf/ui/error";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { Suspense } from "react";

export const metadata = {
    title: "Empfehlungen | Energyleaf",
};

export default function RecommendationsPage() {
    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                    <ErrorBoundary fallback={AvgEnergyConsumptionError}>
                        <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                            <AvgEnergyConsumptionCard />
                        </Suspense>
                    </ErrorBoundary>
                </div>
                <div>
                    <ErrorBoundary fallback={AvgEnergyConsumptionComparisonError}>
                        <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                            <AvgEnergyConsumptionComparisonCard />
                        </Suspense>
                    </ErrorBoundary>
                </div>
            </div>
            <AmortizationCard />
        </div>
    );
}
