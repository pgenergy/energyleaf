"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";

import { AggregationType } from "@energyleaf/db/util";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@energyleaf/ui";

interface Props {
    selected?: AggregationType;
    startDate: Date;
    endDate: Date;
}

export default function EnergyAggreation({ startDate, endDate, selected }: Props) {
    const router = useRouter();
    const pathname = usePathname();

    const onChange = (selectedOption: string) => {
        const search = new URLSearchParams({
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            aggregation: selectedOption,
        });
        router.push(`${pathname}?${search.toString()}`);
        router.refresh();
    };

    return (
        <div className="flex flex-row justify-end gap-4">
            <Select defaultValue={AggregationType.RAW} onValueChange={onChange} value={selected}>
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
