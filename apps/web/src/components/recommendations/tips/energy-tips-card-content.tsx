"use client";

import type { EnergyTip } from "@energyleaf/lib/tips";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { useState } from "react";
import EnergyTipCardDescription from "./energy-tip-card-description";
import EnergyTipRandomPicker from "./energy-tip-random-picker";

interface Props {
    tips: EnergyTip[];
}

export default function EnergyTipsCardContent({ tips }: Props) {
    const [tipIndex, setTipIndex] = useState<number>(0);

    function onNextClick() {
        setTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Energiespartipps</CardTitle>
                <CardDescription>Hier erhalten Sie Tipps, um Strom zu sparen.</CardDescription>
                <EnergyTipCardDescription tip={tips[tipIndex]} />
            </CardHeader>
            <CardContent>
                {tips.length === 0 ? (
                    <div className="flex flex-col items-center text-muted-foreground">Keine Tipps verfügbar.</div>
                ) : (
                    <EnergyTipRandomPicker tip={tips[tipIndex]} onNextTip={onNextClick} />
                )}
            </CardContent>
        </Card>
    );
}
