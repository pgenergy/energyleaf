import { AggregationType } from "@energyleaf/lib";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { getTimezoneOffset } from "date-fns-tz";
import { Suspense } from "react";
import AbsoluteChartView from "../charts/absolute-chart-view";
import HourChartView from "../charts/hour-chart-view";

interface Props {
    initialDate?: Date;
}

export default async function EnergyPageTodayView(props: Props) {
    const offset = getTimezoneOffset("Europe/Berlin", props.initialDate ? props.initialDate : new Date());
    const localOffset = Math.abs(new Date().getTimezoneOffset() * 60 * 1000);

    const serverStartDate = props.initialDate ? new Date(props.initialDate) : new Date();
    serverStartDate.setHours(0, 0, 0, 0);
    const serverEndDate = props.initialDate ? new Date(props.initialDate) : new Date();
    serverEndDate.setHours(23, 59, 59, 999);

    const startDate = offset === localOffset ? serverStartDate : new Date(serverStartDate.getTime() - offset);
    const endDate = offset === localOffset ? serverEndDate : new Date(serverEndDate.getTime() - offset);

    return (
        <div className="col-span-1 grid grid-cols-1 gap-4 md:col-span-3 md:grid-cols-3">
            <Suspense fallback={<Skeleton className="col-span-1 h-40 w-full md:col-span-3" />}>
                <AbsoluteChartView startDate={startDate} endDate={endDate} aggregation={AggregationType.HOUR} />
            </Suspense>
            <Suspense fallback={<Skeleton className="col-span-1 h-96 w-full md:col-span-3" />}>
                <HourChartView startDate={startDate} endDate={endDate} />
            </Suspense>
        </div>
    );
}
