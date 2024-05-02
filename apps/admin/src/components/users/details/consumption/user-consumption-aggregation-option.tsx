import React, { useMemo } from "react";
import { useUserContext } from "@/hooks/user-hook";
import { AggregationOption, calculateAggregationOptions } from '@energyleaf/ui/components/utils';

export default function UserConsumptionAggregationOption() {
    const context = useUserContext();

    const availableOptions = useMemo(() => {
        return calculateAggregationOptions(context.startDate, context.endDate);
    }, [context.startDate, context.endDate]);

    return (
        <AggregationOption
            availableOptions={availableOptions}
            onSelectedChange={context.setAggregationType}
            selected={context.aggregationType}
        />
    );
}
