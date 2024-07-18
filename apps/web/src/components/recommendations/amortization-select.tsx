"use client";

import type { DeviceSelectType } from "@energyleaf/db/types";
import { cn } from "@energyleaf/tailwindcss/utils";
import { Command, CommandInput, CommandItem, CommandList } from "@energyleaf/ui/command";
import { Input } from "@energyleaf/ui/input";
import { CheckIcon } from "lucide-react";
import { useState } from "react";

interface Props {
    devices: DeviceSelectType[];
}

export default function AmortizationSelect({ devices }: Props) {
    const [selectedDevices, setSelectedDevices] = useState<number[]>([]);

    return (
        <Command>
            <CommandList>
                {devices.map((device) => (
                    <CommandItem
                        key={device.id}
                        value={device.id.toString()}
                        className="cursor-pointer border border-secondary"
                        onSelect={(value) => {
                            const id = Number(value);
                            if (selectedDevices.includes(id)) {
                                setSelectedDevices(selectedDevices.filter((d) => d !== id));
                                return;
                            }
                            setSelectedDevices([...selectedDevices, id]);
                        }}
                    >
                        <CheckIcon
                            className={cn(
                                "mr-2 h-4 w-4",
                                selectedDevices.includes(device.id) ? "opacity-100" : "opacity-0",
                            )}
                        />
                        <div className="flex w-full items-center justify-between">
                            <div className="mr-4 flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
                                {device.name}
                            </div>
                            {/* <div className="w-48 flex-none text-left text-xs">
                                Wöchentl. Nutzungsdauer:
                                <Input
                                    type="number"
                                    className="w-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                />
                            </div> */}
                        </div>
                    </CommandItem>
                ))}
            </CommandList>
        </Command>
    );
}
