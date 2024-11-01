import AbsolutEnergyConsumptionCard from "@/components/dashboard/absolut-energy-consumption-card";
import EnergyConsumptionCard from "@/components/dashboard/energy-consumption-card";
import EnergyCostCard from "@/components/dashboard/energy-cost-card";
import GoalsCard from "@/components/dashboard/goals/goals-card";
import { getSession } from "@/lib/auth/auth.server";
import { convertTZDate } from "@energyleaf/lib";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { Suspense } from "react";

export const metadata = {
    title: "Dashboard | Energyleaf",
};
export const maxDuration = 120;

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: { start?: string; end?: string; aggregation?: string };
}) {
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    const aggregationType = searchParams.aggregation;

    const serverStart = new Date();
    serverStart.setHours(0, 0, 0, 0);
    const serverEnd = new Date();
    serverEnd.setHours(23, 59, 59, 999);

    const startDate = convertTZDate(serverStart);
    const endDate = convertTZDate(serverEnd);

    // const csvExportData = {
    //     userId: user.id,
    //     userHash: createHash("sha256").update(`${user.id}${env.HASH_SECRET}`).digest("hex"),
    //     endpoint:
    //         env.VERCEL_ENV === "production" || env.VERCEL_ENV === "preview"
    //             ? `https://${env.NEXT_PUBLIC_ADMIN_URL}/api/v1/csv_energy`
    //             : `http://${env.NEXT_PUBLIC_ADMIN_URL}/api/v1/csv_energy`,
    // };

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="col-span-1 md:col-span-3">
                    <h1 className="font-bold text-2xl">Übersicht</h1>
                </div>
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                    <AbsolutEnergyConsumptionCard endDate={endDate} startDate={startDate} />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                    <EnergyCostCard endDate={endDate} startDate={startDate} />
                </Suspense>
                {fulfills(user.appVersion, Versions.self_reflection) && (
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                        <GoalsCard />
                    </Suspense>
                )}
                <div className="col-span-1 md:col-span-3">
                    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                        <EnergyConsumptionCard
                            aggregationType={aggregationType}
                            endDate={endDate}
                            startDate={startDate}
                            userId={user.id}
                            appVersion={user.appVersion}
                        />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
