import { AggregationType, convertTZDate } from "@energyleaf/lib";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { Suspense } from "react";
import CostAbsoluteChartView from "../charts/absolute-chart-view";
import CostHourChartView from "../charts/hour-chart-view";

interface Props {
    initialDate?: Date;
}

export default async function CostPageTodayView(props: Props) {
    const serverStartDate = props.initialDate ? new Date(props.initialDate) : new Date();
    serverStartDate.setHours(0, 0, 0, 0);
    const serverEndDate = props.initialDate ? new Date(props.initialDate) : new Date();
    serverEndDate.setHours(23, 59, 59, 999);

    const startDate = convertTZDate(serverStartDate);
    const endDate = convertTZDate(serverEndDate);

    return (
        <>
            <div className="col-span-1 grid grid-cols-1 gap-4 md:col-span-3 md:grid-cols-3">
                <Suspense fallback={<Skeleton className="col-span-1 h-40 w-full md:col-span-3" />}>
                    <CostAbsoluteChartView startDate={startDate} endDate={endDate} aggregation={AggregationType.HOUR} />
                </Suspense>
                <Suspense fallback={<Skeleton className="col-span-1 h-96 w-full md:col-span-3" />}>
                    <CostHourChartView startDate={startDate} endDate={endDate} />
                </Suspense>
            </div>
        </>
    );
}
