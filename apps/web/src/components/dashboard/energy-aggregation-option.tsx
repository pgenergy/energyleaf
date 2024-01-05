"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@energyleaf/ui";
import { AggregationType } from "@/types/aggregation/aggregation-type";

interface Props {
    startDate: Date;
    endDate: Date;
}

export default function EnergyAggreation({ startDate, endDate }: Props) {
    const router = useRouter();
    const pathname = usePathname();

    const onChange = (selectedOption: string) => {
        const search = new URLSearchParams({
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            aggregation: selectedOption,
        });
        router.push(`${pathname}?${search.toString()}`);
    };

    return (
        <div className="flex flex-row justify-end gap-4">
            <Select onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Granularität" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={AggregationType.RAW}>Nicht aggregiert</SelectItem>
                    <SelectItem value={AggregationType.HOUR}>Stunde</SelectItem>
                    <SelectItem value={AggregationType.DAY}>Tag</SelectItem>
                    <SelectItem value={AggregationType.MONTH}>Monat</SelectItem>
                    <SelectItem value={AggregationType.YEAR}>Jahr</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
