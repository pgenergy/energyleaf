'use client';
import React from 'react';
import { usePathname, useRouter } from "next/navigation";

interface Props {
    startDate: Date;
    endDate: Date;
}

export default function EnergyAggreation({startDate, endDate}: Props) {
    
    const router = useRouter();
    const pathname = usePathname();

    const onChange = (event) => { 
        const selectedOption = event.target.value;
        
        const search = new URLSearchParams({
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            aggregation: selectedOption,
        });
        router.push(`${pathname}?${search}`);
    }

    return (
        <div className="flex flex-row justify-end gap-4">
            <select name="option" onChange={onChange}>
                <option value="hour">Stunde</option>
                <option value="day">Tag</option>
                <option value="month">Monat</option>
                <option value="year">Jahr</option>
            </select>
        </div>
    );
}