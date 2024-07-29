"use client";

import MultiDatePicker from "@energyleaf/ui/utils/multi-day-picker";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

interface Props {
    children: React.ReactNode;
}

export default function CostsRangeDatePicker(props: Props) {
    const router = useRouter();
    const pathname = usePathname();

    function handleRangeChange(dates: Date[]) {
        const searchParams = new URLSearchParams();

        const date = dates[0].getTime() > dates[1].getTime() ? dates[1] : dates[0];
        const compareDate = dates[0].getTime() > dates[1].getTime() ? dates[0] : dates[1];

        searchParams.set("date", date.toISOString());
        searchParams.set("compareDate", compareDate.toISOString());
        if (pathname === "/costs/compare") {
            router.replace(`/costs/compare?${searchParams.toString()}`, {
                scroll: false,
            });
        } else {
            router.push(`/costs/compare?${searchParams.toString()}`, {
                scroll: false,
            });
        }
    }

    return (
        <MultiDatePicker onChange={handleRangeChange} min={2} max={2}>
            {props.children}
        </MultiDatePicker>
    );
}
