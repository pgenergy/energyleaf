"use client";

import React, { useMemo } from "react";
import { useUserContext } from "@/hooks/user-hook";
import { AggregationOption } from "@energyleaf/ui/components/utils";
import { AggregationType } from "@energyleaf/lib";
import { differenceInCalendarDays, differenceInMonths, differenceInWeeks, differenceInYears } from "date-fns";

export default function UserConsumptionAggregationOption() {
    const context = useUserContext();

    const availableOptions = useMemo(() => {
        const startDate = new Date(context.startDate);
        const endDate = new Date(context.endDate);

        const dayDiff = differenceInCalendarDays(endDate, startDate);
        const monthDiff = differenceInMonths(endDate, startDate);
        const weekDiff = differenceInWeeks(endDate, startDate);
        const yearDiff = differenceInYears(endDate, startDate);

        let options = [AggregationType.RAW];

        if (dayDiff <= 7) options.push(AggregationType.HOUR);
        if (dayDiff >= 2 && monthDiff <= 1) options.push(AggregationType.DAY);
        if (weekDiff >= 2 && monthDiff <= 3) options.push(AggregationType.WEEK);
        if (monthDiff >= 2 && yearDiff <= 1) options.push(AggregationType.MONTH);
        if (yearDiff >= 2) options.push(AggregationType.YEAR);

        return options;
    }, [context.startDate, context.endDate]);

    return (
        <AggregationOption
            availableOptions={availableOptions}
            onSelectedChange={context.setAggregationType}
            selected={context.aggregationType}
        />
    );
}
