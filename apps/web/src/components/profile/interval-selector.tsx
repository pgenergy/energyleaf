"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@energyleaf/ui";
import * as React from "react";

interface Props {
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
}

export default function IntervalSelector({ value, onChange, disabled }: Props) {
    return (
        <Select
            defaultValue={value.toString()}
            onValueChange={(x) => {
                onChange(Number(x));
            }}
            disabled={disabled}
        >
            <SelectTrigger>
                <SelectValue placeholder="Intervall auswählen" />
            </SelectTrigger>
            <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7].map((possibleValues) => (
                    <SelectItem key={possibleValues} value={possibleValues.toString()}>
                        {getString(possibleValues)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function getString(value: number) {
    if (value === 1) {
        return "Täglich";
    }
    if (value === 7) {
        return "Wöchentlich";
    }
    return `Alle ${value.toString()} Tage`;
}
