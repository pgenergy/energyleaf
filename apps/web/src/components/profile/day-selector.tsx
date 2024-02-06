"use client";

import * as React from "react";

import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@energyleaf/ui";
import weekDays from "@/types/enums/weekDays";

export default function DaySelector({field}) {
    return (
        <Select defaultValue={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
                <SelectValue placeholder="Wochentag auswählen"/>
            </SelectTrigger>
            <SelectContent>
                {Object.keys(weekDays)
                    .filter((value) => !isNaN(Number(value)))
                    .map((value) => (
                        <SelectItem key={(value)} value={value}>
                            {(weekDays[value])}
                        </SelectItem>
                    ))}
            </SelectContent>
        </Select>
    );
}