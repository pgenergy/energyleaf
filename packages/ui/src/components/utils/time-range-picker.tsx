"use client";

import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";

interface Props {
    start: Date;
    end: Date;
    onChange: (start: Date, end: Date) => void;
}

export default function TimeRangePicker(props: Props) {
    const [open, setOpen] = useState(false);
    const [startValue, setStartValue] = useState(format(props.start, "HH:mm"));
    const [endValue, setEndValue] = useState(format(props.end, "HH:mm"));

    useEffect(() => {
        setStartValue(format(props.start, "HH:mm"));
        setEndValue(format(props.end, "HH:mm"));
    }, [props.start, props.end]);

    const startString = useMemo(() => {
        return format(props.start, "HH:mm", {
            locale: de,
        });
    }, [props.start]);

    const endString = useMemo(() => {
        return format(props.end, "HH:mm", {
            locale: de,
        });
    }, [props.end]);

    function handleComplete() {
        const newStart = new Date(props.start);
        newStart.setHours(0, 0, 0, 0);
        const newEnd = new Date(props.end);
        newEnd.setHours(23, 59, 59, 999);

        props.onChange(newStart, newEnd);
        setOpen(false);
    }

    function handleLastHours() {
        const newStart = new Date();
        newStart.setHours(newStart.getHours() - 3, 0, 0, 0);
        const newEnd = new Date();
        newEnd.setHours(newEnd.getHours(), 59, 59, 999);

        props.onChange(newStart, newEnd);
        setOpen(false);
    }

    function handleSubmit() {
        const newStart = new Date(props.start);
        newStart.setHours(Number(startValue.split(":")[0]), Number(startValue.split(":")[1]), 0, 0);
        const newEnd = new Date(props.end);
        newEnd.setHours(Number(endValue.split(":")[0]), Number(endValue.split(":")[1]), 59, 999);

        props.onChange(newStart, newEnd);
        setOpen(false);
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline">{`${startString} - ${endString}`}</Button>
            </PopoverTrigger>
            <PopoverContent className="grid grid-cols-2 gap-2">
                {props.start.getDate() === props.end.getDate() && props.start.getDate() === new Date().getDate() ? (
                    <Button type="button" variant="secondary" onClick={handleLastHours}>
                        Letzten 3 Stunden
                    </Button>
                ) : null}
                {props.start.getDate() === props.end.getDate() && props.start.getDate() === new Date().getDate() ? (
                    <Button type="button" variant="secondary" onClick={handleComplete}>
                        Gesamt
                    </Button>
                ) : (
                    <Button type="button" variant="secondary" onClick={handleComplete} className="col-span-2">
                        Gesamt
                    </Button>
                )}
                <Input
                    type="time"
                    value={startValue}
                    onChange={(e) => {
                        setStartValue(e.target.value);
                    }}
                />
                <Input
                    type="time"
                    value={endValue}
                    onChange={(e) => {
                        setEndValue(e.target.value);
                    }}
                />
                <Button type="button" className="col-span-2" onClick={handleSubmit}>
                    Speichern
                </Button>
            </PopoverContent>
        </Popover>
    );
}
