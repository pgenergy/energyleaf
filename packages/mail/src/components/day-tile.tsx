import type { DayStatistics } from "@energyleaf/lib";
import { Text } from "@react-email/components";
import React from "react";
import { TrendIcon } from "./trend-icon";

interface Props {
    stats: DayStatistics;
}

export default function DayTile({ stats }: Props) {
    return (
        <div className="m-4 flex flex-col rounded bg-muted p-2">
            <Text className="m-0 p-0 font-semibold">{stats.day}</Text>
            <Text className="m-0 p-0">{stats.dailyConsumption}</Text>

            <div className={`flex flex-row${(stats.dailyGoal ?? 0) > 0 ? "text-red-600" : "text-primary"}`}>
                <TrendIcon difference={13} size={16} />
                <Text className="m-0 ml-1 text-xs">{stats.progress}</Text>
            </div>
        </div>
    );
}
