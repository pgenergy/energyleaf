"use client";

import {DateRangePicker} from "@energyleaf/ui/components/utils";
import React from "react";
import {useUserDetailsContext} from "@/hooks/user-detail-hook";
import type { DateRange } from "react-day-picker";

export default function UserConsumptionDateRange() {
    const context = useUserDetailsContext();

    function setDates(dr: DateRange | undefined) {
        if (dr?.from && dr.to) {
            context.setStartDate(dr.from);
            context.setEndDate(dr.to);
        }
    }

    return <DateRangePicker endDate={context.endDate} startDate={context.startDate} onChange={dr => setDates(dr)} />
}