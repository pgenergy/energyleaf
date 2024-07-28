"use client";

import RangeNavSelector, { RangeNavButton, RangeNavLink } from "@/components/nav/range-selector";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useSearchParams } from "next/navigation";
import EnergyDatePicker from "./energy-day-picker";
import EnergyRangeDatePicker from "./energy-range-day-picker";

export default function EnergyPageRangeSelector() {
    const searchParams = useSearchParams();
    const date = searchParams.get("date") ? new Date(searchParams.get("date") as string) : undefined;
    const compareDate = searchParams.get("compareDate")
        ? new Date(searchParams.get("compareDate") as string)
        : undefined;

    return (
        <RangeNavSelector>
            <RangeNavLink range="today" href="/energy" />
            {date && !compareDate ? (
                <EnergyDatePicker date={date}>
                    <RangeNavButton href="/energy/custom">{format(date, "PPP", { locale: de })}</RangeNavButton>
                </EnergyDatePicker>
            ) : (
                <EnergyDatePicker date={undefined}>
                    <RangeNavButton href="/energy/custom">Tag wählen</RangeNavButton>
                </EnergyDatePicker>
            )}
            <EnergyRangeDatePicker>
                <RangeNavButton href="/energy/compare">
                    {date && compareDate
                        ? `${format(date, "PP", { locale: de })} - ${format(compareDate, "PP", { locale: de })}`
                        : "Tage Vergleichen"}
                </RangeNavButton>
            </EnergyRangeDatePicker>
            <RangeNavLink range="week" href="/energy/week" />
            <RangeNavLink range="month" href="/energy/month" />
        </RangeNavSelector>
    );
}
