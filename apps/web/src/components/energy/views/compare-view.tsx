import { AggregationType, convertTZDate } from "@energyleaf/lib";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { format } from "date-fns";
import { Suspense } from "react";
import AbsoluteChartView from "../charts/absolute-chart-view";
import CompareChartView from "../charts/compare-chart-view";

interface Props {
    date: Date;
    compareDate: Date;
}

export default async function EnergyPageCompareView(props: Props) {
    const serverStartDate = new Date(props.date);
    serverStartDate.setHours(0, 0, 0, 0);
    const serverEndDate = new Date(props.date);
    serverEndDate.setHours(23, 59, 59, 999);

    const serverCompareStartDate = new Date(props.compareDate);
    serverCompareStartDate.setHours(0, 0, 0, 0);
    const serverCompareEndDate = new Date(props.compareDate);
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
                    aggregation={AggregationType.HOUR}
                    hideAlert
                    title={
                        <h2 className="col-span-1 font-bold text-xl md:col-span-3">{format(serverStartDate, "PP")}</h2>
                    }
                />
            </Suspense>
            <Suspense fallback={<Skeleton className="col-span-1 h-40 w-full md:col-span-3" />}>
                <AbsoluteChartView
                    startDate={compareStartDate}
                    endDate={compareEndDate}
                    aggregation={AggregationType.HOUR}
                    hideAlert
                    title={
                        <h2 className="col-span-1 font-bold text-xl md:col-span-3">
                            {format(serverCompareStartDate, "PP")}
                        </h2>
                    }
                />
            </Suspense>
            <Suspense fallback={<Skeleton className="col-span-1 h-96 md:col-span-3" />}>
                <CompareChartView
                    startDate={startDate}
                    endDate={endDate}
                    compareStartDate={compareStartDate}
                    compareEndDate={compareEndDate}
                />
            </Suspense>
        </div>
    );
}
