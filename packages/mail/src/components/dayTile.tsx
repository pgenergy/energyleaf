import React from "react";
import { Text } from "@react-email/components";
import { CircleDashed, Sparkles } from "lucide-react";

import { DayStatistics } from "../types/reportProps";
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
            {/*getTargetIcon(stats.value, stats.image)}

            <Text className="m-0 p-0 font-semibold">{stats.day.toLocaleDateString()}</Text>
            <Text className="m-0 p-0">{stats.value}</Text>

            <div className={`flex flex-row ${stats.differenceToPrevious > 0 ? "text-red-600" : "text-primary"}`}>
                <TrendIcon difference={13} size={16} />
                <Text className="m-0 ml-1 text-xs">{stats.differenceToPrevious}</Text>
            </div>*/}
        </div>
    );
}
