"use client";

import { useUserDetailsContext } from "@/hooks/user-detail-hook";
import {AggregationOption} from "@energyleaf/ui/components/utils";

export default function UserConsumptionAggregationOption() {
    const context = useUserDetailsContext();
    return <AggregationOption onSelectedChange={context.setAggregationType} selected={context.aggregationType} />;
}