"use client";

import { Calendar } from "@energyleaf/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@energyleaf/ui/popover";
import { useRouter } from "next/navigation";
import * as React from "react";

interface Props {
    children: React.ReactNode;
    date?: Date;
}

export function EnergyDatePicker(props: Props) {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);

    function handleClick(date: Date) {
        const searchParams = new URLSearchParams();
        searchParams.set("date", date.toISOString());
        router.push(`/energy/custom?${searchParams.toString()}`, {
            scroll: false,
        });
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{props.children}</PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={props.date}
                    onSelect={handleClick}
                    initialFocus
                    disabled={(d) => {
                        const currentDate = new Date();
                        return currentDate.getTime() < d.getTime();
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
