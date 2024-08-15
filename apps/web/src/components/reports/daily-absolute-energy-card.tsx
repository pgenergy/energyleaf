import type { DailyGoalStatistic } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import ReportDailyEnergyConsumptionChart from "@energyleaf/ui/charts/reports/report-daily-consumption-chart";

import React from "react";

interface Props {
    dayEnergyStatistics: DailyGoalStatistic[] | undefined;
}

export default function DailyAbsoluteEnergyCard({ dayEnergyStatistics }: Props) {
    if (!dayEnergyStatistics || dayEnergyStatistics.length === 0) {
        return null;
    }

    const dayLengthText =
        dayEnergyStatistics.length === 1
            ? "Ihren gestrigen Tagesverbrauch"
            : `Ihre täglichen Verbräuche der letzten ${dayEnergyStatistics.length} Tage`;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Absoluter Tagesverbrauch</CardTitle>
                <CardDescription>Hier sehen Sie {dayLengthText}.</CardDescription>
            </CardHeader>
            <CardContent>
                <ReportDailyEnergyConsumptionChart data={dayEnergyStatistics} />
            </CardContent>
        </Card>
    );
}
