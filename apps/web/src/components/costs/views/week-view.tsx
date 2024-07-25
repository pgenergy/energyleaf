import { getSession } from "@/lib/auth/auth.server";
import { AggregationType } from "@energyleaf/lib";
import { convertTZDate } from "@energyleaf/lib";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { endOfWeek, startOfWeek } from "date-fns";
import { Suspense } from "react";
import AbsoluteChartView from "../charts/absolute-chart-view";
import DayChartView from "../charts/day-chart-view";

export default async function WeekPageWeekView() {
    const { user } = await getSession();

    if (!user) {
        return null;
    }

    const serverStartDate = startOfWeek(new Date(), { weekStartsOn: 1 });
    serverStartDate.setHours(0, 0, 0, 0);
    const serverEndDate = endOfWeek(new Date(), { weekStartsOn: 1 });
    serverEndDate.setHours(23, 59, 59, 999);

    const serverCompareStartDate = new Date(serverStartDate);
    serverCompareStartDate.setDate(serverCompareStartDate.getDate() - 7);
    const serverCompareEndDate = new Date(serverEndDate);
    serverCompareEndDate.setDate(serverCompareEndDate.getDate() - 7);

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
                    aggregation={AggregationType.WEEKDAY}
                    previousTitle="Zu letzter Woche"
                />
            </Suspense>
            <Suspense fallback={<Skeleton className="col-span-1 h-96 w-full md:col-span-3" />}>
                <DayChartView startDate={startDate} endDate={endDate} />
            </Suspense>
        </div>
    );
}
