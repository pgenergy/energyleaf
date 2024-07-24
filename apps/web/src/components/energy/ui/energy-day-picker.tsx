"use client";

import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import DatePicker from "@energyleaf/ui/utils/date-picker";

interface Props {
    children: React.ReactNode;
    date?: Date;
}

export default function EnergyDatePicker(props: Props) {
    const router = useRouter();
    const pathname = usePathname();

    function handleClick(date: Date) {
        const searchParams = new URLSearchParams();
        searchParams.set("date", date.toISOString());
        if (pathname === "/energy/custom") {
            router.replace(`/energy/custom?${searchParams.toString()}`, {
                scroll: false,
            });
        } else {
            router.push(`/energy/custom?${searchParams.toString()}`, {
                scroll: false,
            });
        }
    }

    return (
        <DatePicker date={props.date} onChange={handleClick}>
            {props.children}
        </DatePicker>
    );
}
