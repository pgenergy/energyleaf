import { getTimezoneOffset } from "date-fns-tz";
import CompareChartView from "../charts/compare-chart-view";

interface Props {
    date: Date;
    compareDate: Date;
}

export default async function EnergyPageCompareView(props: Props) {
    const offset = getTimezoneOffset("Europe/Berlin", props.date);
    const localOffset = Math.abs(new Date().getTimezoneOffset() * 60 * 1000);

    const serverStartDate = new Date(props.date);
    serverStartDate.setHours(0, 0, 0, 0);
    const serverEndDate = new Date(props.date);
    serverEndDate.setHours(23, 59, 59, 999);

    const serverCompareStartDate = new Date(props.compareDate);
    serverCompareStartDate.setHours(0, 0, 0, 0);
    const serverCompareEndDate = new Date(props.compareDate);
    serverCompareEndDate.setHours(23, 59, 59, 999);

    const startDate = offset === localOffset ? serverStartDate : new Date(serverStartDate.getTime() - offset);
    const endDate = offset === localOffset ? serverEndDate : new Date(serverEndDate.getTime() - offset);
    const compareStartDate =
        offset === localOffset ? serverCompareStartDate : new Date(serverCompareStartDate.getTime() - offset);
    const compareEndDate =
        offset === localOffset ? serverCompareEndDate : new Date(serverCompareEndDate.getTime() - offset);

    return (
        <div className="col-span-1 grid grid-cols-1 gap-4 md:col-span-3 md:grid-cols-3">
            <CompareChartView
                startDate={startDate}
                endDate={endDate}
                compareStartDate={compareStartDate}
                compareEndDate={compareEndDate}
            />
        </div>
    );
}
