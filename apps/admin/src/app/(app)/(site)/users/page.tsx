import { Suspense } from "react";
import UsersOverviewCard from "@/components/users/users-overview-card";

import { Skeleton } from "@energyleaf/ui";
import {ErrorBoundary} from "@energyleaf/ui/error";
import {UsersOverviewCardError} from "@/components/users/users-overview-card-error";

export default function UsersPage() {
    return (
        <div className="flex flex-col gap-4">
            <ErrorBoundary fallback={UsersOverviewCardError}>
                <Suspense fallback={<Skeleton className="h-[57rem] w-full" />}>
                    <UsersOverviewCard />
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}
