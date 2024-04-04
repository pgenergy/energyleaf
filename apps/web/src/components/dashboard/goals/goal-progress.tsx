import {CircularProgress} from "@energyleaf/ui";
import { cn } from "@energyleaf/tailwindcss/utils";
import {
    CheckCircleIcon,
    CircleAlertIcon,
    XCircleIcon
} from "lucide-react";
import {type GoalStatus, GoalState} from "@/types/goals";

interface Props {
    goal: GoalStatus;
}

export default function GoalProgress({ goal }: Props) {
    function getCaptionStyle() {
        switch (goal.state) {
            case GoalState.GOOD:
                return "text-primary";
            case GoalState.IN_DANGER:
                return "text-yellow-600";
            case GoalState.EXCEEDED:
                return "text-destructive";
        }
    }
    const captionStyle = getCaptionStyle();

    function getProgressVariant() {
        switch (goal.state) {
            case GoalState.GOOD:
                return "default";
            case GoalState.IN_DANGER:
                return "warning";
            case GoalState.EXCEEDED:
                return "destructive";
        }
    }
    const progressVariant = getProgressVariant();

    function getTooltip() {
        switch (goal.state) {
            case GoalState.GOOD:
                return "Ziel wird nach Prognose erreicht";
            case GoalState.IN_DANGER:
                return "Ziel in Gefahr";
            case GoalState.EXCEEDED:
                return "Ziel überschritten";
        }
    }
    const tooltip = getTooltip();

    function getIcon() {
        const className = cn("w-10 h-10", captionStyle);
        switch (goal.state) {
            case GoalState.GOOD:
                return <CheckCircleIcon className={className} />;
            case GoalState.IN_DANGER:
                return <CircleAlertIcon className={className} />;
            case GoalState.EXCEEDED:
                return <XCircleIcon className={className}/>;
        }
    }

    function formatValue(value: number) {
        return value.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }

    return (
        <div className="w-full flex flex-col gap-4 items-center">
            <h2 className={cn("text-center text-xl font-semibold", captionStyle)}>{goal.goalName}</h2>
            <div className="flex flex-row items-center gap-2" title={tooltip}>
                <CircularProgress progress={goal.progress} variant={progressVariant} strokeWidth={8} size={130}>
                    {`${formatValue(goal.currentValue)} kWh`}
                    <hr className="w-24 border border-t-0 border-accent-foreground" />
                    {`${formatValue(goal.goalValue)} kWh`}
                </CircularProgress>
                {getIcon()}
            </div>
        </div>
    );
}