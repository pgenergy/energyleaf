"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { track } from "@vercel/analytics";

import { AggregationType } from "@energyleaf/db/util";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@energyleaf/ui";

interface Props {
    selected?: AggregationType;
}

export default function EnergyAggreation({ selected }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const onChange = (selectedOption: string) => {
        track("changeAggregationOption()");
        const search = new URLSearchParams();
        searchParams.forEach((value, key) => {
            search.set(key, value);
        });
        search.set("aggregation", selectedOption.toLowerCase());

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
