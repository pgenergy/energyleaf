import UsersOverviewCard from "@/components/users/users-overview-card";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { Suspense } from "react";

export const metadata = {
    title: "Nutzer | Energyleaf Admin",
};

export default function UsersPage() {
    return (
        <div className="flex flex-col gap-4">
            <Suspense fallback={<Skeleton className="h-[57rem] w-full" />}>
                <UsersOverviewCard />
            </Suspense>
        </div>
    );
}
