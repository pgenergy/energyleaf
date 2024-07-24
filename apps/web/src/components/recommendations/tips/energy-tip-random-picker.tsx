"use client";

import type { EnergyTip } from "@energyleaf/lib";
import { Button } from "@energyleaf/ui/button";
import {} from "@tanstack/react-query";
import { ArrowRightIcon, LightbulbIcon } from "lucide-react";
import { useMemo, useState } from "react";

interface Props {
    tips: EnergyTip[];
}

export default function EnergyTipRandomPicker({ tips }: Props) {
    if (tips.length === 0) {
        return <div className="flex flex-col items-center text-muted-foreground">Keine Tipps verfügbar.</div>;
    }

    const shuffledTips = useMemo(() => tips.sort(() => Math.random() - 0.5), [tips]);

    const [tipIndex, setTipIndex] = useState<number>(0);

    function onNextClick() {
        setTipIndex((prev) => (prev + 1) % shuffledTips.length);
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <LightbulbIcon className="h-16 w-16" />
            <span className="text-center text-xl italic">{shuffledTips[tipIndex]?.text}</span>
            <Button className="gap-2" onClick={onNextClick}>
                Nächster Tipp <ArrowRightIcon />
            </Button>
        </div>
    );
}
