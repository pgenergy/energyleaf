"use client";

import * as React from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@energyleaf/ui";

interface Props {
    value: number;
    onChange: (value: number) => void;
}

export default function TimeSelector({ value, onChange }: Props) {
    return (
        <Select
            defaultValue={value.toString()}
            onValueChange={(x) => {
                onChange(Number(x));
            }}
        >
            <SelectTrigger>
                <SelectValue placeholder="Uhrzeit auswählen" />
            </SelectTrigger>
            <SelectContent className="max-h-52">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(
                    (possibleHours) => (
                        <SelectItem key={possibleHours} value={possibleHours.toString()}>
                            {`${possibleHours.toString()}:00`}
                        </SelectItem>
                    ),
                )}
            </SelectContent>
        </Select>
    );
}
