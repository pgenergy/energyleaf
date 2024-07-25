"use client";

import DatePicker from "@energyleaf/ui/utils/date-picker";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

interface Props {
    children: React.ReactNode;
    date?: Date;
}

export default function CostDatePicker(props: Props) {
    const router = useRouter();
    const pathname = usePathname();

    function handleClick(date: Date) {
        const searchParams = new URLSearchParams();
        searchParams.set("date", date.toISOString());
        if (pathname === "/costs/custom") {
            router.replace(`/costs/custom?${searchParams.toString()}`, {
                scroll: false,
            });
        } else {
            router.push(`/costs/custom?${searchParams.toString()}`, {
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
