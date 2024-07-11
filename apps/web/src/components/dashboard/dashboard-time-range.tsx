"use client";

import TimeRangePicker from "@energyleaf/ui/utils/time-range-picker";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Props {
    startDate: Date;
    endDate: Date;
}

export default function DashboardTimeRange({ startDate, endDate }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function onChange(start: Date, end: Date) {
        const search = new URLSearchParams();
        searchParams.forEach((v, key) => {
            search.set(key, v);
        });
        search.set("start", start.toISOString());
        search.set("end", end.toISOString());
        router.push(`${pathname}?${search.toString()}`, {
            scroll: false,
        });
    }

    return <TimeRangePicker end={endDate} onChange={onChange} start={startDate} />;
}
