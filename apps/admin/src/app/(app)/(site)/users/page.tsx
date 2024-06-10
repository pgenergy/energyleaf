import UsersOverviewCard from "@/components/users/users-overview-card";
import { UsersOverviewCardError } from "@/components/users/users-overview-card-error";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { ErrorBoundary } from "@energyleaf/ui/error";
import { Suspense } from "react";

export const metadata = {
    title: "Nutzer | Energyleaf Admin",
};

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
