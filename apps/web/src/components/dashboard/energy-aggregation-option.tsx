"use client";

import { track } from "@vercel/analytics";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { calculateAggregationOptions } from "@energyleaf/lib/utils/use-aggregation-options";
import React, { useMemo } from "react";
import { AggregationOption } from "@energyleaf/ui/utils/aggregation-option";

export default function EnergyAggregation({ selected }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const availableOptions = useMemo(() => {
        const startDateStr = searchParams.get("start");
        const endDateStr = searchParams.get("end");
        return calculateAggregationOptions(startDateStr, endDateStr);
    }, [searchParams]);

    if (availableOptions.length <= 1) {
        return null;
    }

    const onChange = (selectedOption) => {
        track("changeAggregationOption");
        const search = new URLSearchParams();
        searchParams.forEach((value, key) => {
            search.set(key, value);
        });
        search.set("aggregation", selectedOption.toLowerCase());

        router.push(`${pathname}?${search.toString()}`);
        router.refresh();
    };

    return <AggregationOption availableOptions={availableOptions} onSelectedChange={onChange} selected={selected} />;
}
