"use client";

import { DateRangePicker } from "@energyleaf/ui/utils/date-range-picker";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DateRange } from "react-day-picker";

interface Props {
    startDate: Date;
    endDate: Date;
}

export default function DashboardDateRange({ startDate, endDate }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function onChange(value: DateRange) {
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
