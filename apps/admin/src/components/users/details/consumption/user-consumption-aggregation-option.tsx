"use client";

import { useUserContext } from "@/hooks/user-hook";
import { AggregationOption, calculateAggregationOptions } from "@energyleaf/ui/components/utils";
import React, { useMemo } from "react";

export default function UserConsumptionAggregationOption() {
    const context = useUserContext();

    const availableOptions = useMemo(() => {
        return calculateAggregationOptions(context.startDate, context.endDate);
    }, [context.startDate, context.endDate]);

    if (availableOptions.length <= 1) {
        return null;
    }

    return (
        <AggregationOption
            availableOptions={availableOptions}
            onSelectedChange={context.setAggregationType}
            selected={context.aggregationType}
        />
    );
}
