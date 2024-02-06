"use client";

import * as React from "react";

import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@energyleaf/ui";

export default function TimeSelector({field}) {
    return (
        <Select defaultValue={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
                <SelectValue placeholder="Uhrzeit auswählen"/>
            </SelectTrigger>
            <SelectContent>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map((value) => (
                    <SelectItem key={value} value={value.toString()}>
                        {(value + ":00")}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}