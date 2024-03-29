import { Suspense } from "react";
import SensorsOverviewCard from "@/components/sensors/sensors-overview-card";

import { Skeleton } from "@energyleaf/ui";

export default function SensorsPage() {
    return (
        <div className="flex flex-col gap-4">
            <Suspense fallback={<Skeleton className="h-[57rem] w-full" />}>
                <SensorsOverviewCard />
            </Suspense>
        </div>
    );
}
