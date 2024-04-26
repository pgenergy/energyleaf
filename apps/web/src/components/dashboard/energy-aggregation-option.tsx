"use client";

import React, { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { track } from "@vercel/analytics";
import { differenceInCalendarDays, differenceInMonths, differenceInWeeks, differenceInYears } from "date-fns";

import { AggregationOption } from "@energyleaf/ui/components/utils";
import { AggregationType } from "@energyleaf/lib";

interface Props {
    selected?: AggregationType;
}

export default function EnergyAggregation({ selected }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const availableOptions = useMemo(() => {
        const startDateStr = searchParams.get('start');
        const endDateStr = searchParams.get('end');
        if (!startDateStr || !endDateStr) return [AggregationType.RAW];

        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        const dayDiff = differenceInCalendarDays(endDate, startDate);
        const monthDiff = differenceInMonths(endDate, startDate);
        const weekDiff = differenceInWeeks(endDate, startDate);
        const yearDiff = differenceInYears(endDate, startDate);

        let options = [AggregationType.RAW];

        if (dayDiff >= 1) options.push(AggregationType.HOUR);
        if (dayDiff >= 2) options.push(AggregationType.DAY);
        if (weekDiff >= 2) options.push(AggregationType.WEEK);
        if (monthDiff >= 2) options.push(AggregationType.MONTH);
        if (yearDiff >= 2) options.push(AggregationType.YEAR);

        return options;
    }, [searchParams]);

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
        <AggregationOption
        availableOptions={availableOptions}
        onSelectedChange={onChange}
        selected={selected}
    />
);
}
