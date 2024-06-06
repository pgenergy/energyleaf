"use client";

import Select from "react-select";
import makeAnimated from "react-select/animated";
import AsyncSelect from "react-select/async";

interface Option {
    value: string;
    label: string;
}

interface Props {
    values: Option[];
    onSelected: (values: Option[]) => void;
    loadOptions: (searchString: string) => Promise<Option[]>;
    isLoading?: boolean;
}

function MultiSelect({ values, onSelected, loadOptions, isLoading }: Props) {
    const animatedComponents = makeAnimated();

    return (
        <AsyncSelect
            value={values}
            onChange={(selectedOption) => onSelected(selectedOption as Option[])}
            isMulti
            cacheOptions
            loadOptions={loadOptions}
            defaultOptions
            isLoading={isLoading ?? false}
            isDisabled={isLoading ?? false}
            components={animatedComponents}
            name="colors"
            closeMenuOnSelect={false}
            hideSelectedOptions={true}
            isSearchable
            unstyled
            classNames={{
                control: () =>
                    "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed placeholder:text-muted-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                menu: () =>
                    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in",
                multiValue: () => "bg-primary text-primary-foreground rounded-full px-2 py-1",
                multiValueLabel: () => "pr-1 text-xs",
                noOptionsMessage: () => "text-sm text-muted-foreground",
                multiValueRemove: () => "hover:bg-destructive",
                indicatorSeparator: () => "bg-accent",
                valueContainer: () => "flex flex-wrap gap-1",
                option: () => "hover:bg-accent p-2",
                indicatorsContainer: () => "border border-accent",
            }}
            noOptionsMessage={() => "Keine Optionen"}
            placeholder="Geräte auswählen..."
        />
    );
}

export { MultiSelect, type Option };
