"use client";

import { Settings2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import type { DashboardComponentId } from "@/lib/dashboard-components";
import DashboardConfigForm from "./dashboard-config-form";

interface Props {
	activeComponents: DashboardComponentId[];
	hasSimulations: boolean;
}

export default function DashboardConfigDialog(props: Props) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon" className="cursor-pointer">
					<Settings2Icon className="size-4" />
					<span className="sr-only">Dashboard-Einstellungen</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Dashboard anpassen</DialogTitle>
					<DialogDescription>
						Wählen Sie aus, welche Komponenten auf Ihrem Dashboard angezeigt werden sollen.
					</DialogDescription>
				</DialogHeader>
				<DashboardConfigForm
					activeComponents={props.activeComponents}
					hasSimulations={props.hasSimulations}
					onSuccess={() => setOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}
