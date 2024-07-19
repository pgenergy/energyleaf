"use client";

import type { DeviceSelectType } from "@energyleaf/db/types";
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
    );
}
