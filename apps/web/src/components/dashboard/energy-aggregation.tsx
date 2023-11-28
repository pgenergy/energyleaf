'use client';
import React from 'react';

interface Props {
    startDate: Date;
    endDate: Date;
}

export default function EnergyAggreation({ startDate, endDate }: Props) {
    
    const handleOptionChange = (event) => {
        const selectedOption = event.target.value;
        alert('Selected Option:'+ selectedOption)
        switch (selectedOption) {
            case 'day':
                //handleDayOption();
                break;
            case 'week':
                handleWeekOption();
                break;
            case 'month':
                handleMonthOption();
                break;
            case 'year':
                handleYearOption();
                break;
            default:
                break;
        }
    }

    const handleDayOption = (data) => {
        const energyConsumptionPerDay = {};

        for (const value in data) {
            console.log(value)
        }
        return data
    };

    const handleWeekOption = () => {
        
    };

    const handleMonthOption = () => {
        
    };

    const handleYearOption = () => {
        
    };
    
    return (
        <div className="flex flex-row justify-end gap-4">
            <select name="option" onChange={handleOptionChange}>
                <option value="day">Tag</option>
                <option value="week">Woche</option>
                <option value="month">Monat</option>
                <option value="year">Jahr</option>
            </select>
        </div>
    );
}