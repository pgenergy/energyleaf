import { getSession } from "@/lib/auth/auth.server";
import { AggregationType, convertTZDate } from "@energyleaf/lib";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { endOfMonth, startOfMonth } from "date-fns";
import { Suspense } from "react";
import AbsoluteChartView from "../charts/absolute-chart-view";
import CostWeekChartView from "../charts/week-chart-view";

export default async function CostPageMonthView() {
    const { user } = await getSession();

    if (!user) {
        return null;
    }

    const serverStartDate = startOfMonth(new Date());
    serverStartDate.setHours(0, 0, 0, 0);
    const serverEndDate = endOfMonth(new Date());
    serverEndDate.setHours(23, 59, 59, 999);

    const tmpDate = new Date(serverStartDate);
    tmpDate.setDate(tmpDate.getDate() - 1);
    const serverCompareStartDate = startOfMonth(tmpDate);
    const serverCompareEndDate = endOfMonth(tmpDate);
    serverCompareEndDate.setHours(23, 59, 59, 999);

    const startDate = convertTZDate(serverStartDate);
    const endDate = convertTZDate(serverEndDate);
    const compareStartDate = convertTZDate(serverCompareStartDate);
    const compareEndDate = convertTZDate(serverCompareEndDate);

    return (
        <div className="col-span-1 grid grid-cols-1 gap-4 md:col-span-3 md:grid-cols-3">
            <Suspense fallback={<Skeleton className="col-span-1 h-40 w-full md:col-span-3" />}>
                <AbsoluteChartView
                    startDate={startDate}
                    endDate={endDate}
                    compareStartDate={compareStartDate}
                    compareEndDate={compareEndDate}
                    aggregation={AggregationType.WEEK}
                    previousTitle="Zu letztem Monat"
                />
            </Suspense>
            <Suspense fallback={<Skeleton className="col-span-1 h-96 w-full md:col-span-3" />}>
                <CostWeekChartView startDate={startDate} endDate={endDate} />
            </Suspense>
        </div>
    );
}
