"use client";

import { useUserContext } from "@/hooks/user-hook";

import { AggregationOption } from "@energyleaf/ui/components/utils";

export default function UserConsumptionAggregationOption() {
    const context = useUserContext();
    return <AggregationOption onSelectedChange={context.setAggregationType} selected={context.aggregationType} />;
}
