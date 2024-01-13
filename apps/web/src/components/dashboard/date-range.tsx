"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button, Calendar, Popover, PopoverContent, PopoverTrigger } from "@energyleaf/ui";

interface Props {
    startDate: Date;
    endDate: Date;
}

export default function DashboardDateRange({ startDate, endDate }: Props) {
    const router = useRouter();
    const pathname = usePathname();

    const dateString = () => {
        if (startDate.toDateString() === endDate.toDateString()) {
            return format(startDate, "PPP", {
                locale: de,
            });
        }

        return `${format(startDate, "PPP", {
            locale: de,
        })} - ${format(endDate, "PPP", {
            locale: de,
        })}`;
    };

    function onChange(value?: DateRange) {
        if (value?.from && value.to) {
            const search = new URLSearchParams({
                start: value.from.toISOString(),
                end: value.to.toISOString(),
            });
            router.push(`${pathname}?${search.toString()}`);
        }
    }

    const getWeek = useMemo(() => {
        const date = new Date();
        const weekStart = date.getDate() - date.getDay() + 1;
        const weekEnd = weekStart + 6;

        const firstDay = new Date(date.setDate(weekStart));
        const lastDay = new Date(date.setDate(weekEnd));

        return { from: firstDay, to: lastDay };
    }, []);

    const getMonth = useMemo(() => {
        const date = new Date();
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        return { from: monthStart, to: monthEnd };
    }, []);

    return (
        <div className="flex flex-row justify-end gap-4">
            <Popover>
                <PopoverTrigger asChild>
                    <Button className="justify-start text-left font-normal" variant="outline">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateString()}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="flex w-auto flex-col items-center gap-2">
                    <div className="flex flex-row flex-wrap gap-2">
                        <Button
                            onClick={() => {
                                router.push(pathname);
                            }}
                            variant="outline"
                        >
                            Heute
                        </Button>
                        <Button
                            onClick={() => {
                                onChange(getWeek);
                            }}
                            variant="outline"
                        >
                            Woche
                        </Button>
                        <Button
                            onClick={() => {
                                onChange(getMonth);
                            }}
                            variant="outline"
                        >
                            Monat
                        </Button>
                    </div>
                    <Calendar
                        initialFocus
                        mode="range"
                        onSelect={onChange}
                        selected={{
                            from: startDate,
                            to: endDate,
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
