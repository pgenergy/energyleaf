import AmortizationCard from "@/components/recommendations/amortization/amortization-card";
import EnergyTipsCard from "@/components/recommendations/tips/energy-tips-card";
import { getSession } from "@/lib/auth/auth.server";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";

export const metadata = {
    title: "Empfehlungen | Energyleaf",
};

export default async function RecommendationsPage() {
    const { user } = await getSession();
    if (!user || !fulfills(user?.appVersion, Versions.support)) {
        redirect("/dashboard");
    }

    return (
        <div className="flex flex-col gap-4">
            <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                <AmortizationCard />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                <EnergyTipsCard />
            </Suspense>
        </div>
    );
}
