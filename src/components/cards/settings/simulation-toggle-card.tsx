"use client";

import { Loader2Icon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { SimulationTypeValue } from "@/lib/enums";
import { SimulationTypeDisplay } from "@/lib/enums";
import { toggleSimulationEnabledAction } from "@/server/actions/simulations";

interface Props {
	simulationType: SimulationTypeValue;
	enabled: boolean;
	configured: boolean;
}

export default function SimulationToggleCard({ simulationType, enabled, configured }: Props) {
	const [isPending, startTransition] = useTransition();

	const handleToggle = (checked: boolean) => {
		startTransition(async () => {
			const toastId = toast.loading("Speichern...", { duration: Infinity });
			const res = await toggleSimulationEnabledAction(simulationType, checked);
			if (!res.success) {
				toast.error(res.message, { id: toastId, duration: 4000 });
			} else {
				toast.success(res.message, { id: toastId, duration: 4000 });
			}
		});
	};

	const displayName = SimulationTypeDisplay[simulationType];

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-row items-center justify-between gap-4">
					<div className="flex flex-col gap-1">
						<CardTitle>Simulation aktivieren</CardTitle>
						<CardDescription>
							{configured
								? `Aktivieren oder deaktivieren Sie die ${displayName}-Simulation.`
								: `Speichern Sie zuerst die Einstellungen, um die ${displayName}-Simulation zu aktivieren.`}
						</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						{isPending && <Loader2Icon className="size-4 animate-spin" />}
						<Switch checked={enabled} onCheckedChange={handleToggle} disabled={!configured || isPending} />
					</div>
				</div>
			</CardHeader>
		</Card>
	);
}
