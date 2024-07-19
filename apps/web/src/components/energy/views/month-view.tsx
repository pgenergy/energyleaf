import { Skeleton } from "@energyleaf/ui/skeleton";
import { endOfMonth, startOfMonth } from "date-fns";
import { getTimezoneOffset } from "date-fns-tz";
import { Suspense } from "react";
import AbsoluteChartView from "../charts/absolute-chart-view";
import WeekChartView from "../charts/week-chart-view";

export default async function EnergyPageMonthView() {
    const offset = getTimezoneOffset("Europe/Berlin", new Date());
    const serverStartDate = startOfMonth(new Date());
    serverStartDate.setHours(0, 0, 0, 0);
    const serverEndDate = endOfMonth(new Date());
    serverEndDate.setHours(23, 59, 59, 999);

    const startDate = new Date(serverStartDate.getTime() - offset);
    const endDate = new Date(serverEndDate.getTime() - offset);

    return (
        <div className="col-span-1 grid grid-cols-1 gap-4 md:col-span-3 md:grid-cols-3">
            <Suspense fallback={<Skeleton className="col-span-1 h-40 w-full md:col-span-3" />}>
                <AbsoluteChartView startDate={startDate} endDate={endDate} />
            </Suspense>
            <Suspense fallback={<Skeleton className="col-span-1 h-96 w-full md:col-span-3" />}>
                <WeekChartView startDate={startDate} endDate={endDate} />
            </Suspense>
        </div>
    );
}
