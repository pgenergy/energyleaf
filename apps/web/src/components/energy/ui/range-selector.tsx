"use client";

import { type EnergyRangeOptionType, energyRangeOptionKeys, energyRangeOptions } from "@/types/energy";
import { Button, buttonVariants } from "@energyleaf/ui/button";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { EnergyDatePicker } from "./energy-day-picker";

export default function EnergyPageRangeSelector() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const date = searchParams.get("date") ? new Date(searchParams.get("date") as string) : undefined;

    return (
        <div className="col-span-1 grid grid-cols-2 items-center gap-4 md:col-span-3 md:grid-cols-6">
            {energyRangeOptionKeys
                .filter((range) => range !== "custom")
                .map((range) => (
                    <RangeLink key={range} range={range} href={range === "today" ? "/energy" : `/energy/${range}`} />
                ))}
            <EnergyDatePicker date={date}>
                <Button variant={pathname === "/energy/custom" ? "default" : "ghost"}>
                    {date ? format(date, "PPP", { locale: de }) : "Individuell"}
                </Button>
            </EnergyDatePicker>
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
