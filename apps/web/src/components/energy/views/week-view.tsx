import AbsolutEnergyConsumptionCard from "@/components/dashboard/absolut-energy-consumption-card";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { getTimezoneOffset } from "date-fns-tz";
import { Suspense } from "react";

export default async function EnergyPageWeekView() {
    const offset = getTimezoneOffset("Europe/Berlin", new Date());
    const serverStartDate = new Date();
    serverStartDate.setDate(serverStartDate.getDate() - serverStartDate.getDay());
    serverStartDate.setHours(0, 0, 0, 0);
    const serverEndDate = new Date();
    serverEndDate.setHours(23, 59, 59, 999);

    const startDate = new Date(serverStartDate.getTime() - offset);
    const endDate = new Date(serverEndDate.getTime() - offset);

    return (
        <div className="col-span-1 grid grid-cols-1 md:col-span-3 md:grid-cols-3">
            <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                <AbsolutEnergyConsumptionCard startDate={startDate} endDate={endDate} showDescription={false} />
            </Suspense>
        </div>
    );
}
