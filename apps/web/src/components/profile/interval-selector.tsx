"use client";

import * as React from "react";

import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@energyleaf/ui";

interface Props {
    value: number;
    onChange: (value: number) => void;
}

export default function IntervalSelector({value, onChange}: Props) {
    return (
        <Select defaultValue={value.toString()} onValueChange={x => onChange(Number(x))}>
            <SelectTrigger>
                <SelectValue placeholder="Intervall auswählen"/>
            </SelectTrigger>
            <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                <SelectItem key={value} value={value.toString()}>
                    {(getString(value))}
                </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function getString(value: number) {
    let returnValue = "";
    if (value === 1) {
        returnValue = "Täglich";
    }
    else if (value === 7) {
        returnValue = "Wöchentlich";
    }
    else {
        returnValue = "Alle " + value + " Tage";
    }
    return returnValue;
}