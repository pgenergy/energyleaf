import { GoalState, type GoalStatus } from "@/types/goals";
import { cn } from "@energyleaf/tailwindcss/utils";
import { CircularProgress } from "@energyleaf/ui";
import { CheckCircleIcon, CircleAlertIcon, XCircleIcon } from "lucide-react";
import { formatNumber } from "@/lib/consumption/number-format";

interface Props {
    goal: GoalStatus;
}

export default function GoalProgress({ goal }: Props) {
    function getCaptionStyle() {
        switch (goal.state) {
            case GoalState.GOOD:
                return "text-primary";
            case GoalState.IN_DANGER:
                return "text-warning";
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
                return <XCircleIcon className={className} />;
        }
    }

    return (
        <div className="flex w-full flex-col items-center gap-4">
            <h2 className={cn("text-center font-semibold text-xl", captionStyle)}>{goal.goalName}</h2>
            <div className="flex flex-row items-center gap-2" title={tooltip}>
                <CircularProgress progress={goal.progress} variant={progressVariant} strokeWidth={8} size={130}>
                    {`${formatNumber(goal.currentValue)} kWh`}
                    <hr className="w-24 border border-accent-foreground border-t-0" />
                    {`${formatNumber(goal.goalValue)} kWh`}
                </CircularProgress>
                {getIcon()}
            </div>
        </div>
    );
}
