"use client";

import RangeNavSelector, { RangeNavLink } from "@/components/nav/range-selector";
import { Button } from "@energyleaf/ui/button";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { usePathname, useSearchParams } from "next/navigation";
import CostsDatePicker from "./cost-day-picker";
import CostsRangeDatePicker from "./cost-range-day-picker";

export default function CostRangeSelector() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const date = searchParams.get("date") ? new Date(searchParams.get("date") as string) : undefined;
    const compareDate = searchParams.get("compareDate")
        ? new Date(searchParams.get("compareDate") as string)
        : undefined;

    return (
        <RangeNavSelector>
            <RangeNavLink range="today" href="/costs" />
            {date && !compareDate ? (
                <CostsDatePicker date={date}>
                    <Button variant={pathname === "costs/custom" ? "default" : "ghost"}>
                        {format(date, "PPP", { locale: de })}
                    </Button>
                </CostsDatePicker>
            ) : (
                <CostsDatePicker date={undefined}>
                    <Button variant={pathname === "costs/custom" ? "default" : "ghost"}>Tag wählen</Button>
                </CostsDatePicker>
            )}
            <CostsRangeDatePicker>
                <Button variant={pathname === "costs/compare" ? "default" : "ghost"}>
                    {date && compareDate
                        ? `${format(date, "PP", { locale: de })} - ${format(compareDate, "PP", { locale: de })}`
                        : "Tage Vergleichen"}
                </Button>
            </CostsRangeDatePicker>
            <RangeNavLink range="week" href="/costs/week" />
            <RangeNavLink range="month" href="/costs/month" />
        </RangeNavSelector>
    );
}
