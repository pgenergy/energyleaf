import { Suspense } from "react";
import DevicesOverviewCard from "@/components/devices/devices-overview-card";

import { SortOrder } from "@energyleaf/db/util";
import { Skeleton } from "@energyleaf/ui";

interface SearchProps {
    sortOrder?: SortOrder;
    sortProp?: string;
}

export default function DevicesPage({ searchParams }: { searchParams: SearchProps }) {
    const sortOrder = searchParams.sortOrder ? searchParams.sortOrder : SortOrder.ASC;
    const sortPropName = searchParams.sortProp ?? "name";

    return (
        <div className="flex flex-col gap-4">
            <Suspense fallback={<Skeleton className="h-[57rem] w-full" />}>
                <DevicesOverviewCard
                    searchParams={{
                        sortOrder,
                        sortProp: sortPropName,
                    }}
                />
            </Suspense>
        </div>
    );
}
