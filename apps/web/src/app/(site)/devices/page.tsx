import { Suspense } from "react";
import DeviceOverviewError from "@/components/devices/device-overview-card-error";
import DevicesOverviewCard from "@/components/devices/devices-overview-card";
import ErrorBoundary from "@/components/error/error-boundary";

import { Skeleton } from "@energyleaf/ui";

export default function DevicesPage() {
    return (
        <div className="flex flex-col gap-4">
            <ErrorBoundary fallback={DeviceOverviewError}>
                <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                    <DevicesOverviewCard />
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}
