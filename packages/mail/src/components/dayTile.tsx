import {CircleDashed, Sparkles} from "lucide-react";
import React from "react";
import {Text} from "@react-email/components";
import {DayStatistics} from "../types/reportProps";
import {TrendIcon} from "./trendIcon";

function getTargetIcon(value: number, targetValue: number) {
    if (value <= targetValue) {
        return (<Sparkles className="p-1 w-8 h-8 text-primary"/>);
    }

    return (<CircleDashed strokeWidth={2.25} className="p-1 w-8 h-8 text-orange-500"/>);
}


export default function DayTile(props : { stats: DayStatistics }) {
    const stats = props.stats;
    return (
        <div className="flex flex-col p-2 m-4 rounded bg-muted">

            {/*getTargetIcon(stats.value, stats.image)}

            <Text className="m-0 p-0 font-semibold">{stats.dayName}</Text>
            <Text className="m-0 p-0">{stats.value}</Text>

            <div className={`flex flex-row ${stats.differenceToPrevious > 0 ? "text-red-600" : "text-primary"}`}>
                <TrendIcon difference={13}  size={16}/>
                <Text className="m-0 ml-1 text-xs">{stats.differenceToPrevious}</Text>
            </div>*/}
        </div>
    );
}