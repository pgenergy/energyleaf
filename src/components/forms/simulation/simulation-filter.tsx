"use client";

import { FilterIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SimulationTypeDisplay } from "@/lib/enums";

interface Props {
	enabledSimulations: {
		ev: boolean;
		solar: boolean;
		heatpump: boolean;
		battery: boolean;
		tou: boolean;
	};
}

export default function SimulationFilter(props: Props) {
	const searchParams = useSearchParams();
	const router = useRouter();

	const evChecked = searchParams.get("ev") !== "false";
	const solarChecked = searchParams.get("solar") !== "false";
	const heatpumpChecked = searchParams.get("heatpump") !== "false";
	const batteryChecked = searchParams.get("battery") !== "false";
	const touChecked = searchParams.get("tou") !== "false";

	const hasAnyEnabled =
		props.enabledSimulations.ev ||
		props.enabledSimulations.solar ||
		props.enabledSimulations.heatpump ||
		props.enabledSimulations.battery ||
		props.enabledSimulations.tou;

	if (!hasAnyEnabled) {
		return null;
	}

	function updateFilter(key: string, checked: boolean) {
		const query = new URLSearchParams(searchParams);
		if (checked) {
			query.delete(key);
		} else {
			query.set(key, "false");
		}
		router.push(`/simulation?${query.toString()}`, { scroll: false });
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" className="cursor-pointer">
					<FilterIcon className="mr-2 size-4" />
					Simulationen
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<DropdownMenuLabel>Aktive Simulationen</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{props.enabledSimulations.ev ? (
					<DropdownMenuCheckboxItem
						checked={evChecked}
						onCheckedChange={(checked) => updateFilter("ev", Boolean(checked))}
					>
						{SimulationTypeDisplay.ev}
					</DropdownMenuCheckboxItem>
				) : null}
				{props.enabledSimulations.solar ? (
					<DropdownMenuCheckboxItem
						checked={solarChecked}
						onCheckedChange={(checked) => updateFilter("solar", Boolean(checked))}
					>
						{SimulationTypeDisplay.solar}
					</DropdownMenuCheckboxItem>
				) : null}
				{props.enabledSimulations.heatpump ? (
					<DropdownMenuCheckboxItem
						checked={heatpumpChecked}
						onCheckedChange={(checked) => updateFilter("heatpump", Boolean(checked))}
					>
						{SimulationTypeDisplay.heatpump}
					</DropdownMenuCheckboxItem>
				) : null}
				{props.enabledSimulations.battery ? (
					<DropdownMenuCheckboxItem
						checked={batteryChecked}
						onCheckedChange={(checked) => updateFilter("battery", Boolean(checked))}
					>
						{SimulationTypeDisplay.battery}
					</DropdownMenuCheckboxItem>
				) : null}
				{props.enabledSimulations.tou ? (
					<DropdownMenuCheckboxItem
						checked={touChecked}
						onCheckedChange={(checked) => updateFilter("tou", Boolean(checked))}
					>
						{SimulationTypeDisplay.tou}
					</DropdownMenuCheckboxItem>
				) : null}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
