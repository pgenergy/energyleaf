import { X } from "lucide-react";
import * as React from "react";

import { Command as CommandPrimitive } from "cmdk";
import { Badge } from "./badge";
import { Command, CommandGroup, CommandItem, CommandList } from "./command";
import { Spinner } from "./spinner";

type Option = {
    value: string;
    label: string;
};

interface Props<T extends Option> {
    options: T[] | undefined;
    initialSelected?: T[];
    loading?: boolean;
    onSelectedChange: (values: T[]) => void;
    placeholder?: string;
    refetching?: boolean;
}

export function MultiSelect<T extends Option>({
    options,
    placeholder,
    onSelectedChange,
    loading = false,
    refetching = false,
    initialSelected = [],
}: Props<T>) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(false);
    const [selected, setSelected] = React.useState<T[]>([]);
    const [inputValue, setInputValue] = React.useState("");
    const [initialSelectedApplied, setInitialSelectedApplied] = React.useState(false);

    React.useEffect(() => {
        if (refetching) {
            setSelected([]);
            setInitialSelectedApplied(false);
        }
    }, [refetching]);

    React.useEffect(() => {
        if (initialSelected.length > 0 && !initialSelectedApplied && selected.length === 0) {
            setSelected([...initialSelected]);
            setInitialSelectedApplied(true);
        }
    }, [initialSelected, initialSelectedApplied, selected.length]);

    const handleUnselect = React.useCallback(
        (option: T) => {
            const newSelected = [...selected].filter((s) => s.value !== option.value);
            setSelected((prev) => prev.filter((s) => s.value !== option.value));
            onSelectedChange(newSelected);
        },
        [selected, onSelectedChange],
    );

    const handleSelect = React.useCallback(
        (option: T) => {
            setInputValue("");
            const newSelected = [...selected, option];
            setSelected((prev) => [...prev, option]);
            onSelectedChange(newSelected);
        },
        [selected, onSelectedChange],
    );

    const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current;
        if (input) {
            if (e.key === "Delete" || e.key === "Backspace") {
                if (input.value === "") {
                    setSelected((prev) => {
                        const newSelected = [...prev];
                        newSelected.pop();
                        return newSelected;
                    });
                }
            }
            // This is not a default behaviour of the <input /> field
            if (e.key === "Escape") {
                input.blur();
            }
        }
    }, []);

    const selectables = options?.filter((option) => !selected.some((d) => d.value === option.value));

    return (
        <Command onKeyDown={handleKeyDown} className="overflow-visible bg-transparent">
            <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <div className="flex flex-wrap gap-1">
                    {selected.map((option) => {
                        return (
                            <Badge key={option.value} variant="secondary">
                                {option.label}
                                <button
                                    type="button"
                                    className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleUnselect(option);
                                        }
                                    }}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onClick={() => handleUnselect(option)}
                                >
                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </button>
                            </Badge>
                        );
                    })}
                    {/* Avoid having the "Search" Icon */}
                    {loading ? (
                        <div className="ml-2 flex flex-1 flex-row justify-center bg-transparent outline-none placeholder:text-muted-foreground">
                            <Spinner />
                        </div>
                    ) : (
                        <CommandPrimitive.Input
                            ref={inputRef}
                            value={inputValue}
                            onValueChange={setInputValue}
                            onBlur={() => setOpen(false)}
                            onFocus={() => setOpen(true)}
                            placeholder={placeholder}
                            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                            disabled={loading}
                        />
                    )}
                </div>
            </div>
            <div className="relative mt-2">
                <CommandList>
                    {open && selectables && selectables.length > 0 && !loading ? (
                        <div className="absolute top-0 z-10 w-full animate-in rounded-md border bg-popover text-popover-foreground shadow-md outline-none">
                            <CommandGroup className="h-full overflow-auto">
                                {selectables.map((option) => {
                                    return (
                                        <CommandItem
                                            key={option.value}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onSelect={(_) => {
                                                handleSelect(option);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Delete" || e.key === "Backspace") {
                                                    e.preventDefault();
                                                }
                                            }}
                                            className={"cursor-pointer"}
                                        >
                                            {option.label}
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </div>
                    ) : null}
                </CommandList>
            </div>
        </Command>
    );
}
