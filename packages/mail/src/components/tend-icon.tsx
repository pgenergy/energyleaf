import { MoveRight, TrendingDown, TrendingUp } from "lucide-react";
import React from "react";
import { TrendModes } from "../types/trend-modes";

interface Props {
    size: number;
    mode: TrendModes;
}

export function TrendIcon({ size, mode }: Props) {
    if (mode === TrendModes.UP) {
        return <TrendingUp className="text-destructive" size={size} />;
    }

    if (mode === TrendModes.DOWN) {
        return <TrendingDown className="text-primary" size={size} />;
    }

    return <MoveRight size={size} />;
}
