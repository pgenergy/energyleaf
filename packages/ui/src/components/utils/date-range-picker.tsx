import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "../../ui/button";
import { Calendar } from "../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";

interface Props {
    startDate: Date;
    endDate: Date;
    onChange: (value: DateRange) => void;
}

export function DateRangePicker({ startDate: initStartDate, endDate: initEndDate, onChange }: Props) {
    const initRange = useMemo(() => {
        return {
            from: initStartDate,
            to: initEndDate,
        };
    }, [initStartDate, initEndDate]);
    const [range, setRange] = useState<DateRange | undefined>(initRange);

    const calFooter = useMemo(() => {
        return range?.from && range.to ? null : <p>Bitte geben Sie einen Zeitraum an.</p>;
    }, [range]);

    const dateString = () => {
        if (initStartDate.toDateString() === initEndDate.toDateString()) {
            return format(initStartDate, "PPP", {
                locale: de,
            });
        }

        return `${format(initStartDate, "PPP", {
            locale: de,
        })} - ${format(initEndDate, "PPP", {
            locale: de,
        })}`;
    };

    function onChangeInternal(value?: DateRange) {
        setRange(value);

        if (value?.from && value.to) {
            onChange(value);
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

    const getToday = useMemo(() => {
        const date = new Date();
        const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
        const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
        return { from: startDate, to: endDate };
    }, []);

    return (
        <div className="flex flex-row justify-end gap-4">
            <Popover
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setRange(initRange);
                    }
                }}
            >
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
                                onChangeInternal(getToday);
                            }}
                            variant="outline"
                        >
                            Heute
                        </Button>
                        <Button
                            onClick={() => {
                                onChangeInternal(getWeek);
                            }}
                            variant="outline"
                        >
                            Woche
                        </Button>
                        <Button
                            onClick={() => {
                                onChangeInternal(getMonth);
                            }}
                            variant="outline"
                        >
                            Monat
                        </Button>
                    </div>
                    <Calendar
                        initialFocus
                        mode="range"
                        onSelect={onChangeInternal}
                        selected={range}
                        footer={calFooter}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
