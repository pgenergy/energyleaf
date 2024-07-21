"use client";

import { Calendar } from "@energyleaf/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@energyleaf/ui/popover";
import { de } from "date-fns/locale";
import { useRouter } from "next/navigation";
import * as React from "react";

interface Props {
    children: React.ReactNode;
}

export function EnergyRangeDatePicker(props: Props) {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [range, setRange] = React.useState<Date[] | undefined>(undefined);

    React.useEffect(() => {
        if (range && range.length === 2) {
            if (range[0].getDate() === range[1].getDate()) {
                setRange([range[0]]);
                return;
            }

            handleRangeChange(range);
            setRange(undefined);
        }
    }, [range]);

    function handleRangeChange(dates: Date[]) {
        const searchParams = new URLSearchParams();

        const date = dates[0].getTime() > dates[1].getTime() ? dates[1] : dates[0];
        const compareDate = dates[0].getTime() > dates[1].getTime() ? dates[0] : dates[1];

        searchParams.set("date", date.toISOString());
        searchParams.set("compareDate", compareDate.toISOString());
        router.push(`/energy/compare?${searchParams.toString()}`, {
            scroll: false,
        });
        setOpen(false);
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{props.children}</PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="multiple"
                    min={2}
                    max={2}
                    selected={range}
                    onSelect={setRange}
                    initialFocus
                    locale={de}
                    disabled={(d) => {
                        const currentDate = new Date();
                        return currentDate.getTime() < d.getTime();
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
