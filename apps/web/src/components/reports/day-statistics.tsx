import { type DailyGoalStatistic, formatDate } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { CircularProgress } from "@energyleaf/ui/circular-progress";
import React from "react";

interface DayEnergyStatisticsProps {
    dayEnergyStatistics: DailyGoalStatistic[] | undefined;
}

const DayTile: React.FC<{ stats: DailyGoalStatistic }> = ({ stats }) => {
    const progVariant = stats.exceeded ?? false ? "destructive" : "default";

    return (
        <div className="m-4 flex flex-col items-center gap-2 p-2">
            <CircularProgress progress={stats.progress ?? 0} variant={progVariant} strokeWidth={8} size={100}>
                <span className="text-xl">{Math.round(stats.progress ?? 0)}%</span>
            </CircularProgress>
            <span className="m-0 p-0 font-semibold"> {formatDate(stats.day)}</span>
        </div>
    );
};

const DayStatistics: React.FC<DayEnergyStatisticsProps> = ({ dayEnergyStatistics }) => {
    console.log(dayEnergyStatistics);
    if (!dayEnergyStatistics || dayEnergyStatistics.length === 0) {
        return null;
    }

    const dayLengthText =
        dayEnergyStatistics.length === 1 ? "gestern" : `in den letzten ${dayEnergyStatistics.length} Tagen`;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Tägliche Ziele</CardTitle>
                <CardDescription>Hier sehen Sie, ob Sie Ihre Ziele {dayLengthText} erreicht haben.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4">
                {dayEnergyStatistics?.map((x) => (
                    <DayTile key={x.day.toDateString()} stats={x} />
                ))}
            </CardContent>
        </Card>
    );
};

export default DayStatistics;
