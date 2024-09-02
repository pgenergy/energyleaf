import { DeviceCategoryPowerState } from "@energyleaf/postgres/types";
import {
    SquareArrowDown,
    SquareArrowDownRight,
    SquareArrowRight,
    SquareArrowUp,
    SquareArrowUpRight,
} from "lucide-react";

interface Props {
    state: DeviceCategoryPowerState;
}

export default function DeviceCategoryPowerIcon({ state }: Props) {
    switch (state) {
        case DeviceCategoryPowerState.VERY_FRUGAL:
            return <SquareArrowDown className="h-5 w-5 text-primary" />;
        case DeviceCategoryPowerState.FRUGAL:
            return <SquareArrowDownRight className="h-5 w-5 text-primary" />;
        case DeviceCategoryPowerState.MEDIUM:
            return <SquareArrowRight className="h-5 w-5 text-warning" />;
        case DeviceCategoryPowerState.ABOVE_AVERAGE:
            return <SquareArrowUpRight className="h-5 w-5 text-warning" />;
        case DeviceCategoryPowerState.HIGH:
            return <SquareArrowUp className="h-5 w-5 text-destructive" />;
        default:
            return null;
    }
}
