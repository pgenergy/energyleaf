"use client";

import { Calendar } from "@energyleaf/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@energyleaf/ui/popover";
import { de } from "date-fns/locale";
import * as React from "react";

interface Props {
    children: React.ReactNode;
    max: number;
    min: number;
    onChange: (dates: Date[]) => void;
}

export default function MultiDatePicker(props: Props) {
    const [open, setOpen] = React.useState(false);
    const [range, setRange] = React.useState<Date[] | undefined>(undefined);

    // biome-ignore lint/correctness/useExhaustiveDependencies: function can change
    React.useEffect(() => {
        if (range && range.length === props.min) {
            if (range[0].getDate() === range[1].getDate()) {
                setRange([range[0]]);
                return;
            }

            props.onChange(range);
            setRange(undefined);
        }
    }, [range, props.min]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{props.children}</PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="multiple"
                    min={props.min}
                    max={props.max}
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
