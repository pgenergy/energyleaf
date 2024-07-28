"use client";

import RangeNavSelector, { RangeNavButton, RangeNavLink } from "@/components/nav/range-selector";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useSearchParams } from "next/navigation";
import CostsDatePicker from "./cost-day-picker";
import CostsRangeDatePicker from "./cost-range-day-picker";

export default function CostRangeSelector() {
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
                    <RangeNavButton href="/costs/custom">{format(date, "PPP", { locale: de })}</RangeNavButton>
                </CostsDatePicker>
            ) : (
                <CostsDatePicker date={undefined}>
                    <RangeNavButton href="/costs/custom">Tag wählen</RangeNavButton>
                </CostsDatePicker>
            )}
            <CostsRangeDatePicker>
                <RangeNavButton href="/costs/compare">
                    {date && compareDate
                        ? `${format(date, "PP", { locale: de })} - ${format(compareDate, "PP", { locale: de })}`
                        : "Tage Vergleichen"}
                </RangeNavButton>
            </CostsRangeDatePicker>
            <RangeNavLink range="week" href="/costs/week" />
            <RangeNavLink range="month" href="/costs/month" />
        </RangeNavSelector>
    );
}
