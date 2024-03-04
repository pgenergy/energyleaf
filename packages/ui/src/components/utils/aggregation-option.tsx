import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../ui";
import {AggregationType} from "@energyleaf/db/util";
import React from "react";

interface Props {
    selected?: AggregationType;
    onSelectedChange: (selected: AggregationType) => void;
}

export function AggregationOption({selected, onSelectedChange: onChange}: Props) {
    return (
        <div className="flex flex-row justify-end gap-4">
            <Select defaultValue={AggregationType.RAW} onValueChange={onChange} value={selected}>
                <SelectTrigger>
                    <SelectValue placeholder="Granularität"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={AggregationType.RAW}>Nicht aggregiert</SelectItem>
                    <SelectItem value={AggregationType.HOUR}>Stunde</SelectItem>
                    <SelectItem value={AggregationType.DAY}>Tag</SelectItem>
                    <SelectItem value={AggregationType.MONTH}>Monat</SelectItem>
                    <SelectItem value={AggregationType.YEAR}>Jahr</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}