import { Skeleton } from "@energyleaf/ui/skeleton";
import { Suspense } from "react";
import CostAverageCard from "../ui/average-cost-card";
import ThrieftiestCostCard from "../ui/thrieftiest-cost-card";

export default function CostMoreDataView() {
    return (
        <>
            <h2 className="col-span-1 font-bold text-xl md:col-span-3">Weitere Daten</h2>
            <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                <CostAverageCard agg="day" />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                <CostAverageCard agg="week" />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                <ThrieftiestCostCard agg="day" />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                <ThrieftiestCostCard agg="week" />
            </Suspense>
        </>
    );
}
