"use client";

import { type EnergyRangeOptionType, energyRangeOptionKeys, energyRangeOptions } from "@/types/energy";
import { Button } from "@energyleaf/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@energyleaf/ui/dropdown-menu";
import { ChevronDownIcon, CircleIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface Props {
    range: EnergyRangeOptionType;
}

export default function EnergyPageRangeSelector(props: Props) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [selectedRange, setSelectedRange] = useState<EnergyRangeOptionType>(props.range);

    function handleRangeChange(range: EnergyRangeOptionType) {
        const params = new URLSearchParams(searchParams);
        params.set("range", range);
        router.push(`${pathname}?${params.toString()}`, {
            scroll: false,
        });
        setSelectedRange(range);
    }

    return (
        <div className="col-span-1 flex flex-row md:col-span-3">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" type="button" className="flex flex-row items-center gap-2 font-bold text-xl">
                        {energyRangeOptions[selectedRange]}
                        <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {energyRangeOptionKeys.map((range) => (
                        <DropdownMenuItem
                            key={range}
                            className="cursor-pointer"
                            onClick={() => handleRangeChange(range)}
                        >
                            {selectedRange === range ? (
                                <CircleIcon className="mr-2 h-2 w-2 fill-current" />
                            ) : (
                                <div className="mr-2 h-2 w-2" />
                            )}
                            {energyRangeOptions[range]}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
