import {CircularProgress} from "@energyleaf/ui";
import { cn } from "@energyleaf/tailwindcss/utils";
import {
    CheckCircleIcon,
    CircleAlertIcon,
    XCircleIcon
} from "lucide-react";
import { GoalState } from "@/types/goals";

interface Props {
    goalValue: number;
    currentValue: number;
    state: GoalState;
    goalName: string;
}

export default function GoalProgress({ goalValue, currentValue, state, goalName }: Props) {
    if (currentValue < 0) {
        throw new Error("Current value must be greater than 0");
    }

    if (goalValue < 0) {
        throw new Error("Goal value must be greater than 0");
    }

    if (state === GoalState.EXCEEDED && currentValue < goalValue) {
        throw new Error("Current value must be greater than or equal to the goal value when the state is EXCEEDED");
    }

    const progress = currentValue >= goalValue ? 100 : (currentValue / goalValue) * 100;

    function getCaptionStyle() {
        switch (state) {
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
        switch (state) {
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
        switch (state) {
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
        switch (state) {
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
            <h2 className={cn("text-center text-xl font-semibold", captionStyle)}>{goalName}</h2>
            <div className="flex flex-row items-center gap-2" title={tooltip}>
                <CircularProgress progress={progress} variant={progressVariant} strokeWidth={8} size={130}>
                    {formatValue(currentValue) + " kWh"}
                    <hr className="w-24 border border-t-0 border-accent-foreground" />
                    {formatValue(goalValue) + " kWh"}
                </CircularProgress>
                {getIcon()}
            </div>
        </div>
    );
}