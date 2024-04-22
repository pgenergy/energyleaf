"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { track } from "@vercel/analytics";

import { AggregationType } from "@energyleaf/lib";
import { AggregationOption } from "@energyleaf/ui/components/utils";

interface Props {
    selected?: AggregationType;
}

export default function EnergyAggregation({ selected }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const availableOptions: AggregationType[] = [
        AggregationType.RAW,
        AggregationType.HOUR,
        AggregationType.DAY,
        AggregationType.WEEK,
        AggregationType.MONTH,
        AggregationType.YEAR,
    ];

    const onChange = (selectedOption: AggregationType) => {
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
        <AggregationOption 
            onSelectedChange={onChange} 
            selected={selected} 
            availableOptions={availableOptions} 
        />
    );
}
