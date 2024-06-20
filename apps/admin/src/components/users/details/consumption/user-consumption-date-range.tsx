"use client";

import { useUserContext } from "@/hooks/user-hook";
import { DateRangePicker } from "@energyleaf/ui/utils/date-range-picker";
import React from "react";
import type { DateRange } from "react-day-picker";

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
