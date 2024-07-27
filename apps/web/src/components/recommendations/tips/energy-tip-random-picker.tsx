"use client";

import type { EnergyTip } from "@energyleaf/lib/tips";
import { Button } from "@energyleaf/ui/button";
import {} from "@tanstack/react-query";
import { ArrowRightIcon, LightbulbIcon } from "lucide-react";
import { useState } from "react";
import EnergyTipText from "./energy-tip-text";

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
            <EnergyTipText tip={tips[tipIndex]} />
            <Button className="gap-2" onClick={onNextClick}>
                Nächster Tipp <ArrowRightIcon />
            </Button>
        </div>
    );
}
