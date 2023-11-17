import { Skeleton } from "@energyleaf/ui";
import { SortOrder } from "@energyleaf/db/util";
import DevicesOverviewCard from "@/components/devices/devices-overview-card";
import { Suspense } from "react";

export default async function DevicesPage({ searchParams }: { searchParams: { sortOrder: SortOrder, sortProp: String } }) {
    return (
        <div className="flex flex-col gap-4">
            <Suspense fallback={<Skeleton className="h-[57rem] w-full" />}>
                <DevicesOverviewCard searchParams={searchParams} />
            </Suspense>
        </div>
    );
}