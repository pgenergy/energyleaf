import KeyFiguresOverviewCard from "@/components/reports/key-figures-overview-card";
import { getReportByIdAndUser } from "@energyleaf/db/query";
import React from "react";
import DailyAbsoluteEnergyCard from "./daily-absolute-energy-card"; // Import the component
import DayStatisticsCard from "./day-statistics-card";

interface Props {
    reportId?: string;
    userId: string;
}

export default async function ReportView(props: Props) {
    const report = props.reportId ? await getReportByIdAndUser(props.reportId, props.userId) : undefined;

    if (!report) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4">
            <DayStatisticsCard dayEnergyStatistics={report.dayEnergyStatistics} />
            <KeyFiguresOverviewCard report={report} />
            <DailyAbsoluteEnergyCard dayEnergyStatistics={report.dayEnergyStatistics} />
        </div>
    );
}
