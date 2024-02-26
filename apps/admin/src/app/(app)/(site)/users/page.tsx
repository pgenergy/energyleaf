import { Suspense } from "react";
import UsersOverviewCard from "@/components/users/users-overview-card";

import { Skeleton } from "@energyleaf/ui";

export default function UsersPage() {
    return (
        <div className="flex flex-col gap-4">
            <Suspense fallback={<Skeleton className="h-[57rem] w-full" />}>
                <UsersOverviewCard />
            </Suspense>
        </div>
    );
}
