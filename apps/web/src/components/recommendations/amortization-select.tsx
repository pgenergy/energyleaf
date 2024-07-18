"use client";

import type { DeviceSelectType } from "@energyleaf/db/types";
import { cn } from "@energyleaf/tailwindcss/utils";
import { Command, CommandInput, CommandItem, CommandList } from "@energyleaf/ui/command";
import { Input } from "@energyleaf/ui/input";
import { CheckIcon } from "lucide-react";
import { useState } from "react";

interface Props {
    devices: DeviceSelectType[];
    selected: DeviceSelectType[];
    onSelectedChange: (selected: DeviceSelectType[]) => void;
}

export default function AmortizationSelect({ devices, selected, onSelectedChange }: Props) {
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
                            if (selected.filter((d) => d.id === id).length > 0) {
                                onSelectedChange(selected.filter((d) => d.id !== id));
                                return;
                            }

                            const device = devices.find((d) => d.id === id);
                            if (!device) return;
                            onSelectedChange([...selected, device]);
                        }}
                    >
                        <CheckIcon
                            className={cn(
                                "mr-2 h-4 w-4",
                                selected.filter(x => x.id == device.id).length > 0 ? "opacity-100" : "opacity-0",
                            )}
                        />
                        <div className="flex w-full items-center justify-between">
                            <div className="mr-4 flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
                                {device.name}
                            </div>
                            {/*<div className="w-48 flex-none text-left text-xs">*/}
                            {/*    Wöchentl. Nutzungsdauer:*/}
                            {/*    <Input*/}
                            {/*        type="number"*/}
                            {/*        className="w-full"*/}
                            {/*        onClick={(e) => {*/}
                            {/*            e.stopPropagation();*/}
                            {/*        }}*/}
                            {/*    />*/}
                            {/*</div>*/}
                        </div>
                    </CommandItem>
                ))}
            </CommandList>
        </Command>
    );
}
