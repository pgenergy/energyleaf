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

export function AggregationOption({ selected, onSelectedChange: onChange, availableOptions }: Props) {
    return (
        <div className="flex flex-row justify-end gap-4">
            <Select defaultValue={AggregationType.RAW} onValueChange={onChange} value={selected}>
                <SelectTrigger>
                    <SelectValue placeholder="Granularität" />
                </SelectTrigger>
                <SelectContent>
                    {Object.values(AggregationType).map((type) =>
                        availableOptions.includes(type) ? (
                            <SelectItem key={type} value={type}>
                                {aggregationLabels[type]}
                            </SelectItem>
                        ) : null
                    )}
                </SelectContent>
            </Select>
        </div>
    );
}
