"use client";

import type { EnergyTip } from "@energyleaf/lib/tips";
import { Button } from "@energyleaf/ui/button";
import {} from "@tanstack/react-query";
import { ArrowRightIcon, ExternalLink, LightbulbIcon } from "lucide-react";
import { useState } from "react";

interface Props {
    tips: EnergyTip[];
}

export default function EnergyTipRandomPicker({ tips }: Props) {
    if (tips.length === 0) {
        return <div className="flex flex-col items-center text-muted-foreground">Keine Tipps verfügbar.</div>;
    }

    const [tipIndex, setTipIndex] = useState<number>(0);

    function onNextClick() {
        setTipIndex((prev) => (prev + 1) % tips.length);
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <LightbulbIcon className="h-16 w-16" />
            <div className="text-center text-xl italic">
                {tips[tipIndex]?.text}
                <span className="inline-flex items-center">
                    <a href={tips[tipIndex].linkToSource} className="ml-1 flex items-center">
                        <ExternalLink className="h-4 w-4" />
                    </a>
                </span>
            </div>
            <Button className="gap-2" onClick={onNextClick}>
                Nächster Tipp <ArrowRightIcon />
            </Button>
        </div>
    );
}
