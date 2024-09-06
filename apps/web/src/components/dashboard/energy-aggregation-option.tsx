"use client";

import type { AggregationType } from "@energyleaf/lib";
import { calculateAggregationOptions } from "@energyleaf/lib/utils/use-aggregation-options";
import { AggregationOption } from "@energyleaf/ui/utils/aggregation-option";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useMemo } from "react";

interface Props {
    selected?: AggregationType;
    startDate: Date;
    endDate: Date;
}

export default function EnergyAggregation({ selected, startDate, endDate }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const availableOptions = useMemo(() => {
        const startDateStr = searchParams.get("start") ?? startDate.toISOString();
        const endDateStr = searchParams.get("end") ?? endDate.toISOString();
        return calculateAggregationOptions(startDateStr, endDateStr);
    }, [searchParams, startDate, endDate]);

    if (availableOptions.length <= 1) {
        return null;
    }

    const onChange = (selectedOption) => {
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
