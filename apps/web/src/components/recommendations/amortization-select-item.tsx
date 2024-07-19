import { device } from "@energyleaf/db/schema";
import type { DeviceCategory, DeviceSelectType } from "@energyleaf/db/types";
import { formatNumber } from "@energyleaf/lib";
import { cn } from "@energyleaf/tailwindcss/utils";
import { Button } from "@energyleaf/ui/button";
import { Input } from "@energyleaf/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@energyleaf/ui/popover";
import { CheckIcon, ExternalLink, Info, InfoIcon, SendToBackIcon, Undo2, Undo2Icon, XIcon } from "lucide-react";
import { useState } from "react";
import DeviceCategoryIcon from "../devices/device-category-icon";
import type { DeviceItem } from "./amortization-card";

interface Props {
    device: DeviceItem;
    onClick: (deviceId: number) => void;
    isSelected: boolean;
    onWeeklyUsageChange: (newValue: number) => void;
}

export default function AmortizationSelectItem({ device, isSelected, onClick, onWeeklyUsageChange }: Props) {
    const [usageValue, setUsageValue] = useState<number | null>(device.weeklyUsageEstimation);

    const onUsageChange = (newValue: number | null) => {
        setUsageValue(newValue);
        if (newValue) {
            onWeeklyUsageChange(newValue);
        }
    };

    return (
        <Button
            key={device.id}
            className="flex h-92 w-full border-collapse flex-row items-center gap-2 border"
            value={device.id}
            variant={"ghost"}
            onClick={(e) => {
                const id = Number(e.currentTarget.value);
                onClick(id);
            }}
        >
            <CheckIcon className={cn("mr-2 h-6 w-6", isSelected ? "opacity-100" : "opacity-0")} />
            <div className="flex w-full flex-col items-start gap-6">
                <div className="flex flex-row gap-2">
                    <DeviceCategoryIcon category={device.category as DeviceCategory} />
                    <span className="text-primary">{device.name}</span>
                </div>
                <div className="grid grid-cols-2 items-center text-left text-xs">
                    <span className="font-semibold">Geschätzte Leistung:</span>
                    <span>Wöchentl. Nutzungsdauer (in Stunden):</span>
                    <span>{formatNumber(device.powerEstimation ?? 0)} W</span>
                    <div className="flex flex-row items-center gap-1">
                        <Input
                            type="number"
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            value={usageValue ?? undefined}
                            onChange={(e) => {
                                const targetValue = e.target.value;
                                if (targetValue.length === 0) {
                                    onUsageChange(null);
                                    return;
                                }

                                const targetValueNumber = Number(targetValue);
                                onUsageChange(Math.max(0, targetValueNumber));
                            }}
                            onBlur={(e) => {
                                if (e.target.value.length === 0) {
                                    onUsageChange(device.weeklyUsageEstimation);
                                }
                            }}
                        />
                        <Popover>
                            <PopoverTrigger
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                <InfoIcon className="h-6 w-6" />
                            </PopoverTrigger>
                            <PopoverContent className="flex flex-col gap-2">
                                Dieser Wert wurde anhand Ihrer Peaks geschätzt. Sie können ihn hier für die
                                Amortisationsrechnung anpassen.
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>
        </Button>
    );
}
