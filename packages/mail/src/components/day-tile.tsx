import { type DailyGoalStatistic, formatDate } from "@energyleaf/lib";
import { Img, Section, Text } from "@react-email/components";
import React from "react";

interface Props {
    stats: DailyGoalStatistic;
}

export default function DayTile({ stats }: Props) {
    return (
        <div className="m-4 items-center rounded bg-muted p-2 text-center">
            <Text className="m-0 p-0 font-semibold">{formatDate(stats.day)}</Text>
            <Img className="pb-4" src={stats.image} alt={`Erreichung Zielverbrauch für ${stats.day}`} />
        </div>
    );
}
