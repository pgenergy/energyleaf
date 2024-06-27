import { AggregationType, aggregationLabels } from "@energyleaf/lib";
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui";

interface Props {
    selected?: AggregationType;
    onSelectedChange: (selected: AggregationType) => void;
    availableOptions: AggregationType[];
}

export function AggregationOption({ selected, onSelectedChange, availableOptions }: Props) {
    const filteredOptions = Object.values(AggregationType).filter((type) => availableOptions.includes(type));

    return (
        <div className="flex flex-row justify-end gap-4">
            <Select defaultValue={AggregationType.RAW} onValueChange={onSelectedChange} value={selected}>
                <SelectTrigger>
                    <SelectValue placeholder="Granularität" />
                </SelectTrigger>
                <SelectContent>
                    {filteredOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                            {aggregationLabels[type]}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
