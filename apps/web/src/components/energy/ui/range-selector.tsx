"use client";

import { type EnergyRangeOptionType, energyRangeOptions } from "@/types/energy";
import { Button, buttonVariants } from "@energyleaf/ui/button";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { EnergyDatePicker } from "./energy-day-picker";
import { EnergyRangeDatePicker } from "./energy-range-day-picker";

export default function EnergyPageRangeSelector() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const date = searchParams.get("date") ? new Date(searchParams.get("date") as string) : undefined;
    const compareDate = searchParams.get("compareDate")
        ? new Date(searchParams.get("compareDate") as string)
        : undefined;

    return (
        <div className="col-span-1 flex flex-row flex-wrap items-center justify-center gap-4 md:col-span-3 md:justify-start">
            <RangeLink range="today" href="/energy" />
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
                        : "Tage Vergleichen"}
                </Button>
            </EnergyRangeDatePicker>
            <RangeLink range="week" href="/energy/week" />
            <RangeLink range="month" href="/energy/month" />
        </div>
    );
}

interface RangeLinkProps {
    range: EnergyRangeOptionType;
    href: string;
}

function RangeLink(props: RangeLinkProps) {
    const pathname = usePathname();

    return (
        <Link
            href={props.href}
            className={buttonVariants({
                variant: props.href === pathname ? "default" : "ghost",
            })}
        >
            {energyRangeOptions[props.range]}
        </Link>
    );
}
