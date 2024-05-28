import type { DayStatistics } from "@energyleaf/lib";
import { Text } from "@react-email/components";
import { CircleDashed, Sparkles } from "lucide-react";
import React from "react";
import { TrendIcon } from "./trendIcon";

function getTargetIcon(value: number, targetValue: number) {
    if (value <= targetValue) {
        return <Sparkles className="h-8 w-8 p-1 text-primary" />;
    }

    return <CircleDashed strokeWidth={2.25} className="h-8 w-8 p-1 text-orange-500" />;
}

export default function DayTile(props: { stats: DayStatistics }) {
    const stats = props.stats;
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
