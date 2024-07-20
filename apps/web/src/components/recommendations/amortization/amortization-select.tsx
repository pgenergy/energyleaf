"use client";

import type { DeviceSelectType } from "@energyleaf/db/types";
import { formatNumber } from "@energyleaf/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@energyleaf/ui/popover";
import { ExternalLink, Info } from "lucide-react";
import type { DeviceItem } from "./amortization-card";
import AmortizationSelectItem from "./amortization-select-item";

interface Props {
    devices: DeviceItem[];
    selected: DeviceItem[];
    onSelectedChange: (selected: DeviceItem[]) => void;
    onDeviceWeeklyUsageChange: (device: DeviceItem, weeklyUsage: number) => void;
}

export default function AmortizationSelect({ devices, selected, onSelectedChange, onDeviceWeeklyUsageChange }: Props) {
    return (
        <div>
            <div className="flex flex-row items-center gap-2">
                <h2 className="font-bold text-xl">Geräte</h2>
                <Popover>
                    <PopoverTrigger>
                        <Info className="h-4 w-4" />
                    </PopoverTrigger>
                    <PopoverContent className="flex flex-col gap-2">
                        Es werden nur Geräte angezeigt, deren Leistung schlechter als die Leistung des Referenzgerätes
                        geschätzt wird.
                        <br />
                        Durch Klick auf ein Gerät wird dieses ausgewählt oder abgewählt werden. In der
                        Amortisationsrechnung werden nur ausgewählte Geräte berücksichtigt.
                    </PopoverContent>
                </Popover>
            </div>

            <div className="h-full overflow-auto">
                {devices.map((device) => {
                    return (
                        <AmortizationSelectItem
                            key={device.id}
                            device={device}
                            isSelected={selected.filter((x) => x.id === device.id).length > 0}
                            onClick={(id) => {
                                if (selected.filter((d) => d.id === id).length > 0) {
                                    onSelectedChange(selected.filter((d) => d.id !== id));
                                    return;
                                }

                                const device = devices.find((d) => d.id === id);
                                if (!device) return;
                                onSelectedChange([...selected, device]);
                            }}
                            onWeeklyUsageChange={(newValue) => {
                                onDeviceWeeklyUsageChange(device, newValue);
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
