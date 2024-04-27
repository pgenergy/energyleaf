import React from "react";
import { AggregationType } from "@energyleaf/lib";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui";

interface Props {
    selected?: AggregationType;
    onSelectedChange: (selected: AggregationType) => void;
    availableOptions: AggregationType[];
}

const aggregationLabels = {
    [AggregationType.RAW]: "Nicht aggregiert",
    [AggregationType.HOUR]: "Stunde",
    [AggregationType.DAY]: "Tag",
    [AggregationType.WEEK]: "Woche",
    [AggregationType.MONTH]: "Monat",
    [AggregationType.YEAR]: "Jahr",
};

export function AggregationOption({ selected, onSelectedChange, availableOptions }: Props) {
    const filteredOptions = Object.values(AggregationType).filter(type => availableOptions.includes(type));

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
