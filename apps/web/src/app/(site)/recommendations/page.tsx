import AmortizationCard from "@/components/recommendations/amortization-card";
import { ErrorBoundary } from "@energyleaf/ui/error";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { Suspense } from "react";
import {getSession} from "@/lib/auth/auth.server";
import {getUserData} from "@/query/user";

export const metadata = {
    title: "Empfehlungen | Energyleaf",
};

export default async function RecommendationsPage() {
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    const userData = await getUserData(user.id);
    if (!userData?.workingPrice) {
        return null; // TODO: Was schönes basteln.
    }

    return (
        <div className="flex flex-col gap-4">
            <AmortizationCard workingPrice={userData.workingPrice} />
        </div>
    );
}
