import React from "react";
import { MoveRight, TrendingDown, TrendingUp } from "lucide-react";

export function TrendIcon(props: { size: number; difference: number }) {
    if (props.difference > 0) {
        return <TrendingUp size={props.size} />;
    }

    if (props.difference < 0) {
        return <TrendingDown size={props.size} />;
    }

    return <MoveRight size={props.size} />;
}
