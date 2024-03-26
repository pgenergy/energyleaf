"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { track } from "@vercel/analytics";
import type { DateRange } from "react-day-picker";

import { DateRangePicker } from "@energyleaf/ui/components/utils";

interface Props {
    startDate: Date;
    endDate: Date;
}

export default function DashboardDateRange({ startDate, endDate }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function onChange(value: DateRange) {
        track("changeDashboardDateRange()");

        if (value.from && value.to) {
            const search = new URLSearchParams();
            searchParams.forEach((v, key) => {
                search.set(key, v);
            });
            search.set("start", value.from.toISOString());
            search.set("end", value.to.toISOString());
            router.push(`${pathname}?${search.toString()}`);
        }
    }

    return <DateRangePicker endDate={endDate} onChange={onChange} startDate={startDate} />;
}
