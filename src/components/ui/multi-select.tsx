import { Command as CommandPrimitive } from "cmdk";
import { X } from "lucide-react";
import * as React from "react";
import { Badge } from "./badge";
import { Command, CommandGroup, CommandItem, CommandList } from "./command";

type Option = {
	value: string;
	label: string;
	icon?: React.ReactNode;
};

interface Props<T extends Option> {
	options: T[] | undefined;
	initialSelected?: T[];
	onSelectedChange: (values: T[]) => void;
	placeholder?: string;
}

export function MultiSelect<T extends Option>({
	options,
	placeholder,
	onSelectedChange,
	initialSelected = [],
}: Props<T>) {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [open, setOpen] = React.useState(false);
	const [selected, setSelected] = React.useState<T[]>(initialSelected);
	const [inputValue, setInputValue] = React.useState("");

	const handleUnselect = React.useCallback(
		(option: T) => {
			const newSelected = [...selected].filter((s) => s.value !== option.value);
			setSelected((prev) => prev.filter((s) => s.value !== option.value));
			onSelectedChange(newSelected);
		},
		[selected, onSelectedChange]
	);

	const handleSelect = React.useCallback(
		(option: T) => {
			setInputValue("");
			const newSelected = [...selected, option];
			setSelected((prev) => [...prev, option]);
			onSelectedChange(newSelected);
		},
		[selected, onSelectedChange]
	);

	const handleKeyDown = React.useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			const input = inputRef.current;
			if (input) {
				if (e.key === "Delete" || e.key === "Backspace") {
					if (input.value === "") {
						const newSelected = [...selected];
						newSelected.pop();
						setSelected((prev) => {
							const newSelected = [...prev];
							newSelected.pop();
							return newSelected;
						});
						onSelectedChange(newSelected);
					}
				}
				// This is not a default behaviour of the <input /> field
				if (e.key === "Escape") {
					input.blur();
				}
			}
		},
		[onSelectedChange, selected]
	);

	const selectables = options?.filter((option) => !selected.some((d) => d.value === option.value));

	return (
		<Command onKeyDown={handleKeyDown} className="overflow-visible bg-transparent">
			<div className="group border-input ring-offset-background focus-within:ring-ring rounded-md border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-offset-2">
				<div className="flex flex-wrap gap-1">
					{selected.map((option) => {
						return (
							<Badge key={option.value} variant="secondary">
								{option.icon ? option.icon : null}
								{option.label}
								<button
									type="button"
									className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
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
									<X className="text-muted-foreground hover:text-foreground h-3 w-3" />
								</button>
							</Badge>
						);
					})}
					<CommandPrimitive.Input
						ref={inputRef}
						value={inputValue}
						onValueChange={setInputValue}
						onBlur={() => setOpen(false)}
						onFocus={() => setOpen(true)}
						placeholder={placeholder}
						className="placeholder:text-muted-foreground ml-2 flex-1 bg-transparent outline-none"
					/>
				</div>
			</div>
			<div className="relative mt-2">
				<CommandList>
					{open && selectables && selectables.length > 0 ? (
						<div className="animate-in bg-popover text-popover-foreground absolute top-0 z-10 w-full rounded-md border shadow-md outline-none">
							<CommandGroup className="h-full overflow-auto">
								{selectables.map((option) => {
									return (
										<CommandItem
											key={option.value}
											onMouseDown={(e) => {
												e.preventDefault();
												e.stopPropagation();
											}}
											onSelect={() => {
												handleSelect(option);
											}}
											onKeyDown={(e) => {
												if (e.key === "Delete" || e.key === "Backspace") {
													e.preventDefault();
												}
											}}
											className={"flex cursor-pointer flex-row justify-between"}
										>
											{option.label}
											{option.icon ? option.icon : null}
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
