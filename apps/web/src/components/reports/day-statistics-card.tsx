import { type DailyGoalStatistic, formatDate } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { CircularProgress } from "@energyleaf/ui/circular-progress";
import React from "react";

interface DayEnergyStatisticsProps {
    dayEnergyStatistics: DailyGoalStatistic[] | undefined;
}

interface DayTileProps {
    stats: DailyGoalStatistic;
}

function DayTile({ stats }: DayTileProps) {
    const progVariant = stats.exceeded ?? false ? "destructive" : "default";

    return (
        <div className="m-4 flex flex-col items-center gap-2 p-2">
            <CircularProgress progress={stats.progress ?? 0} variant={progVariant} strokeWidth={8} size={100}>
                <span className="text-xl">{Math.round(stats.progress ?? 0)}%</span>
            </CircularProgress>
            <span className="m-0 p-0 font-semibold"> {formatDate(stats.day)}</span>
        </div>
    );
}

export default function DayStatisticsCard({ dayEnergyStatistics }: DayEnergyStatisticsProps) {
    if (!dayEnergyStatistics || dayEnergyStatistics.length === 0) {
        return null;
    }

    const dayLengthText =
        dayEnergyStatistics.length === 1 ? "an dem Tag" : `in den ${dayEnergyStatistics.length} Tagen`;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tägliche Ziele</CardTitle>
                <CardDescription>
                    Hier sehen Sie, ob Sie Ihre Ziele {dayLengthText} des ausgewählten Berichts erreicht haben.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4">
                {dayEnergyStatistics?.map((x) => (
                    <DayTile key={x.day.toDateString()} stats={x} />
                ))}
            </CardContent>
        </Card>
    );
}
