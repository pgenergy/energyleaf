import { Calendar } from "@energyleaf/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@energyleaf/ui/popover";
import { de } from "date-fns/locale";
import * as React from "react";

interface Props {
    children: React.ReactNode;
    onChange: (date: Date) => void;
    date?: Date;
}

export default function DatePicker(props: Props) {
    const [open, setOpen] = React.useState(false);

    function handleClick(date: Date) {
        props.onChange(date);
        setOpen(false);
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
