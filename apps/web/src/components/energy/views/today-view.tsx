import { Skeleton } from "@energyleaf/ui/skeleton";
import { getTimezoneOffset } from "date-fns-tz";
import { Suspense } from "react";
import AbsoluteChartView from "../charts/absolute-chart-view";
import HourChartView from "../charts/hour-chart-view";

export default async function EnergyPageTodayView() {
    const offset = getTimezoneOffset("Europe/Berlin", new Date());
    const localOffset = Math.abs(new Date().getTimezoneOffset() * 60 * 1000);

    const serverStartDate = new Date();
    serverStartDate.setHours(0, 0, 0, 0);
    const serverEndDate = new Date();
    serverEndDate.setHours(23, 59, 59, 999);

    const startDate = offset === localOffset ? serverStartDate : new Date(serverStartDate.getTime() - offset);
    const endDate = offset === localOffset ? serverEndDate : new Date(serverEndDate.getTime() - offset);

    return (
        <div className="col-span-1 grid grid-cols-1 gap-4 md:col-span-3 md:grid-cols-3">
            <Suspense fallback={<Skeleton className="col-span-1 h-40 w-full md:col-span-3" />}>
                <AbsoluteChartView startDate={startDate} endDate={endDate} />
            </Suspense>
            <Suspense fallback={<Skeleton className="col-span-1 h-96 w-full md:col-span-3" />}>
                <HourChartView startDate={startDate} endDate={endDate} />
            </Suspense>
        </div>
    );
}
