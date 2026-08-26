"use client";

import { Loader2Icon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toggleSolarFeedInVisualizationAction } from "@/server/actions/settings";

interface Props {
	checked: boolean;
}

export default function SolarFeedInVisualizationToggle({ checked }: Props) {
	const [isPending, startTransition] = useTransition();

	const handleToggle = (checked: boolean) => {
		startTransition(async () => {
			const toastId = toast.loading("Speichern...", { duration: Infinity });
			const res = await toggleSolarFeedInVisualizationAction(checked);
			if (!res.success) {
				toast.error(res.message, { id: toastId, duration: 4000 });
			} else {
				toast.success(res.message, { id: toastId, duration: 4000 });
			}
		});
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-row items-center justify-between gap-4">
					<div className="flex flex-col gap-1">
						<CardTitle>Einspeisung anzeigen</CardTitle>
						<CardDescription>
							Aktivieren Sie diese Option, um die Einspeisung Ihrer Solaranlage angezeigt zu bekommen.
						</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						{isPending && <Loader2Icon className="size-4 animate-spin" />}
						<Switch checked={checked} onCheckedChange={handleToggle} disabled={isPending} />
					</div>
				</div>
			</CardHeader>
		</Card>
	);
}