"use client";

import RangeNavSelector, { RangeNavLink } from "@/components/nav/range-selector";
import { Button } from "@energyleaf/ui/button";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { usePathname, useSearchParams } from "next/navigation";
import EnergyDatePicker from "./energy-day-picker";
import EnergyRangeDatePicker from "./energy-range-day-picker";

export default function EnergyPageRangeSelector() {
    const pathname = usePathname();
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
                    <Button variant={pathname === "/energy/custom" ? "default" : "ghost"}>
                        {format(date, "PPP", { locale: de })}
                    </Button>
                </EnergyDatePicker>
            ) : (
                <EnergyDatePicker date={undefined}>
                    <Button variant={pathname === "/energy/custom" ? "default" : "ghost"}>Tag wählen</Button>
                </EnergyDatePicker>
            )}
            <EnergyRangeDatePicker>
                <Button variant={pathname === "/energy/compare" ? "default" : "ghost"}>
                    {date && compareDate
                        ? `${format(date, "PP", { locale: de })} - ${format(compareDate, "PP", { locale: de })}`
                        : "Tage vergleichen"}
                </Button>
            </EnergyRangeDatePicker>
            <RangeNavLink range="week" href="/energy/week" />
            <RangeNavLink range="month" href="/energy/month" />
        </RangeNavSelector>
    );
}
