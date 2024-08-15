import KeyFiguresOverviewCard from "@/components/reports/key-figures-overview-card";
import { getReportById } from "@/query/reports";
import React from "react";
import DailyAbsoluteEnergyCard from "./daily-absolute-energy-card";
import DayStatisticsCard from "./day-statistics-card";

interface Props {
    reportId: string;
    userId: string;
}

export default async function ReportView(props: Props) {
    const report = await getReportById(props.reportId, props.userId);

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
