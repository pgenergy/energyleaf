"use client";

import { TimeZoneType } from "@/lib/enums";
import { endOfMonth, endOfWeek, isSameDay, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { de } from "date-fns/locale";
import { XIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface Props {
	disallowFuture?: boolean;
	disallowedDates?: Date[];
	timezone: TimeZoneType;
	range: "day" | "week" | "month";
	href: string;
	paramName?: string;
	rangeParamName?: string[];
	children: React.ReactNode;
	showClear?: boolean;
}

export default function DaySelector(props: Props) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [date, setDate] = useState<Date | undefined>(startOfDay(new Date(searchParams.get("date") || new Date())));

	return (
		<div className="flex flex-row items-center gap-2">
			<Popover>
				<PopoverTrigger asChild>
					<Button variant="outline" className="cursor-pointer">
						{props.children}
					</Button>
				</PopoverTrigger>
				<PopoverContent>
					<Calendar
						locale={de}
						weekStartsOn={1}
						mode="single"
						selected={date}
						onSelect={(date) => {
							setDate(date);
							if (date) {
								const query = new URLSearchParams(searchParams);
								const paramName = props.paramName || "date";
								const [startName, endName] = props.rangeParamName || ["start", "end"];

								if (props.range === "day") {
									query.set(paramName, date.toISOString());
								} else if (props.range === "week") {
									const start = startOfWeek(date, { weekStartsOn: 1 });
									const end = endOfWeek(date, { weekStartsOn: 1 });
									query.set(startName, start.toISOString());
									query.set(endName, end.toISOString());
								} else if (props.range === "month") {
									const start = startOfMonth(date);
									const end = endOfMonth(date);
									query.set(startName, start.toISOString());
									query.set(endName, end.toISOString());
								}

								router.push(`${props.href}?${query.toString()}`, {
									scroll: false,
								});
							} else {
								router.push(props.href, {
									scroll: false,
								});
							}
						}}
						disabled={(date) => {
							if (props.disallowFuture) {
								return date > new Date();
							}

							if (props.disallowedDates && props.disallowedDates.length > 0) {
								return props.disallowedDates.some((disallowedDate) => isSameDay(date, disallowedDate));
							}

							return false;
						}}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
			{props.showClear ? (
				<Button
					variant="ghost"
					size="icon"
					className="cursor-pointer"
					onClick={() => {
						const query = new URLSearchParams(searchParams);
						if (props.rangeParamName) {
							for (const paramName of props.rangeParamName) {
								query.delete(paramName);
							}
						} else {
							query.delete(props.paramName || "date");
						}

						router.push(`${props.href}?${query.toString()}`, {
							scroll: false,
						});
					}}
				>
					<XIcon className="size-4" />
				</Button>
			) : null}
		</div>
	);
}
