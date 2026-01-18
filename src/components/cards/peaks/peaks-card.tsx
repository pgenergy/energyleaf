"use client";

import { format, isSameDay } from "date-fns";
import { de } from "date-fns/locale";
import { MoreVerticalIcon, PlusIcon, Trash2Icon, ZapIcon } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import EnergyMiniChart from "@/components/charts/energy/energy-mini-chart";
import { DeviceCategoryToIcon } from "@/components/icons/device-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DeviceCategory } from "@/lib/enums";
import { deletePeakAction } from "@/server/actions/peaks";
import type { EnergyData, EnergyDataSequence } from "@/server/db/tables/sensor";

type PeakEnergyData = Pick<EnergyData, "timestamp" | "consumption">;

type PeakEnergyDataSequence = Pick<EnergyDataSequence, "id" | "start" | "end" | "averagePeakPower">;

interface Props {
	peak: PeakEnergyDataSequence & { energyData: PeakEnergyData[] };
	devices: {
		name: string;
		id: string;
		category: DeviceCategory;
	}[];
}

export default function PeakCard(props: Props) {
	const [pending, startTransition] = useTransition();

	function deletePeak() {
		startTransition(async () => {
			const toastId = toast.loading("Peak wird gelöscht...", {
				duration: Infinity,
			});
			const res = await deletePeakAction(props.peak.id);

			if (!res) {
				toast.success("Ein unerwarteter Fehler ist aufgetreten.", {
					id: toastId,
					duration: 4000,
				});
				return;
			}

			if (!res.success) {
				toast.error(res.message, {
					id: toastId,
					duration: 4000,
				});
			} else {
				toast.success(res.message, {
					id: toastId,
					duration: 4000,
				});
			}
		});
	}

	return (
		<Card className="col-span-1">
			<CardHeader>
				<div className="flex flex-row items-center justify-between">
					<div className="flex flex-col gap-1">
						<CardTitle>
							{format(props.peak.start, "HH:mm")} - {format(props.peak.end, "HH:mm")}
						</CardTitle>
						<CardDescription>
							{isSameDay(props.peak.end, props.peak.start)
								? format(props.peak.start, "PPP", { locale: de })
								: `${format(props.peak.start, "dd.MM PPP", { locale: de })} - ${format(props.peak.end, "dd.MM PPP", { locale: de })}`}
						</CardDescription>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="cursor-pointer">
								<MoreVerticalIcon className="size-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem asChild disabled={pending}>
								<Link href={`/peaks/${props.peak.id}/edit`} className="cursor-pointer">
									<PlusIcon />
									Geräte hinzufügen
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem
								disabled={pending}
								className="text-destructive cursor-pointer"
								onClick={deletePeak}
							>
								<Trash2Icon className="stroke-destructive" />
								Löschen
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-2">
				<div className="flex flex-row items-center">
					<ZapIcon className="size-4" />
					<p className="font-mono font-bold">{props.peak.averagePeakPower.toFixed(2)} Watt</p>
				</div>
				<div className="flex flex-row flex-wrap items-center gap-2">
					{props.devices.length > 0 ? (
						props.devices.map((device) => (
							<Badge className="flex flex-row items-center gap-2" variant="secondary" key={device.id}>
								{DeviceCategoryToIcon(device.category)}
								{device.name}
							</Badge>
						))
					) : (
						<p className="text-muted-foreground text-sm">
							Bisher keine{" "}
							<Link className="underline hover:no-underline" href={`/peaks/${props.peak.id}/edit`}>
								Geräte hinzugefügt
							</Link>
							.
						</p>
					)}
				</div>
				<EnergyMiniChart data={props.peak.energyData} />
			</CardContent>
		</Card>
	);
}
