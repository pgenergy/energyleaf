'use client';
import React from 'react';
import { usePathname, useRouter } from "next/navigation";
import { format } from "date-fns";
import de from "date-fns/locale/de";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button, Calendar, Popover, PopoverContent, PopoverTrigger } from "@energyleaf/ui";
import App from 'next/app';

interface Props {
    startDate: Date;
    endDate: Date;
}

export default function EnergyAggreation({ startDate, endDate }: Props) {
    
    const handleOptionChange = (event) => {
        const selectedOption = event.target.value;
        alert('Selected Option:'+ selectedOption)
        switch (selectedOption) {
            case 'hours':
                handleHoursOption();
                break;
            case 'days':
                handleDaysOption();
                break;
            case 'weeks':
                handleWeeksOption();
                break;
            case 'months':
                handleMonthsOption();
                break;
            default:
                break;
        }
    }

    const handleHoursOption = () => {
        
    };

    const handleDaysOption = () => {
        
    };

    const handleWeeksOption = () => {
        
    };

    const handleMonthsOption = () => {
        
    };
    
    return (
        <div className="flex flex-row justify-end gap-4">
            <select name="option" onChange={handleOptionChange}>
                <option value="hours">Stunden</option>
                <option value="days">Tage</option>
                <option value="weeks">Wochen</option>
                <option value="months">Monate</option>
            </select>
        </div>
    );
}