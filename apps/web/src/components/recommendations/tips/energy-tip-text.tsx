"use client";

import type { EnergyTip } from "@energyleaf/lib/tips";
import { ExternalLink } from "lucide-react";

interface Props {
    tip: EnergyTip;
}

export default function EnergyTipText({ tip }: Props) {
    return (
        <div className="text-center text-xl italic">
            {tip.text}
            <span className="inline-flex items-center">
                <a href={tip.linkToSource} className="ml-1 flex items-center">
                    <ExternalLink className="h-4 w-4" />
                </a>
            </span>
        </div>
    );
}
