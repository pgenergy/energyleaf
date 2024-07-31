"use client";

import DeviceCategoryIcon from "@/components/devices/device-category-icon";
import { type EnergyTip, isDeviceCategory } from "@energyleaf/lib/tips";
import { Button } from "@energyleaf/ui/button";
import { ArrowRightIcon, LightbulbIcon } from "lucide-react";
import EnergyTipText from "./energy-tip-text";

interface Props {
    onNextTip?: () => void;
    tip: EnergyTip;
}

export default function EnergyTipRandomPicker({ onNextTip, tip }: Props) {
    function onNextClick() {
        onNextTip?.();
    }

    return (
        <div className="flex flex-col items-center gap-4">
            {tip.belongsTo && isDeviceCategory(tip.belongsTo) ? (
                <DeviceCategoryIcon category={tip.belongsTo} className="h-16 w-16" />
            ) : (
                <LightbulbIcon className="h-16 w-16" />
            )}
            <EnergyTipText tip={tip} />
            <Button className="gap-2" onClick={onNextClick}>
                Nächster Tipp <ArrowRightIcon />
            </Button>
        </div>
    );
}
