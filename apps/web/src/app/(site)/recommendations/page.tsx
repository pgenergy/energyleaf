import AmortizationCard from "@/components/recommendations/amortization-card";
import { ErrorBoundary } from "@energyleaf/ui/error";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { Suspense } from "react";

export const metadata = {
    title: "Empfehlungen | Energyleaf",
};

export default function RecommendationsPage() {
    return (
        <div className="flex flex-col gap-4">
            <AmortizationCard />
        </div>
    );
}
