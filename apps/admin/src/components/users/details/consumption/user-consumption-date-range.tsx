"use client";

import React from "react";
import { useUserContext } from "@/hooks/user-hook";
import type { DateRange } from "react-day-picker";

import { DateRangePicker } from "@energyleaf/ui/components/utils";

export default function UserConsumptionDateRange() {
    const context = useUserContext();

    function setDates(dr: DateRange) {
        if (dr.from && dr.to) {
            context.setStartDate(dr.from);
            context.setEndDate(dr.to);
        }
    }

    return <DateRangePicker endDate={context.endDate} onChange={setDates} startDate={context.startDate} />;
}
