"use client";

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
import { getReferencePowerDataForDeviceCategory } from "@/lib/device/power";
import { DeviceCategoryDisplay } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { deleteDeviceAction } from "@/server/actions/device";
import { Device } from "@/server/db/tables/device";
import { EditIcon, MoreVerticalIcon, Trash2Icon, ZapIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useTransition } from "react";
import { toast } from "sonner";

interface Props {
	device: Device;
}

export default function DeviceCard(props: Props) {
	const [pending, startTransition] = useTransition();

	const referenceData = useMemo(
		() => getReferencePowerDataForDeviceCategory(props.device.category),
		[props.device.category]
	);

	function deleteDevice() {
		startTransition(async () => {
			const toastId = toast.loading("Gerät wird gelöscht...", {
				duration: Infinity,
			});
			const res = await deleteDeviceAction(props.device.id);

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
		<Card>
			<CardHeader>
				<div className="flex flex-row items-center gap-4">
					<div className="bg-accent text-accent-foreground flex h-10 w-10 items-center justify-center rounded-full">
						{DeviceCategoryToIcon(props.device.category)}
					</div>
					<div className="flex flex-1 flex-row justify-between">
						<div className="flex flex-col gap-1">
							<CardTitle>{props.device.name}</CardTitle>
							<CardDescription>{DeviceCategoryDisplay[props.device.category]}</CardDescription>
						</div>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="cursor-pointer">
									<MoreVerticalIcon className="size-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem asChild disabled={pending}>
									<Link href={`/devices/${props.device.id}/edit`} className="cursor-pointer">
										<EditIcon />
										Bearbeiten
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem
									disabled={pending}
									className="text-destructive cursor-pointer"
									onClick={deleteDevice}
								>
									<Trash2Icon className="stroke-destructive" />
									Löschen
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{props.device.power ? (
					<div className="flex flex-col gap-1">
						<div className="flex flex-row items-center justify-between">
							<div className="flex flex-row items-center gap-1">
								<ZapIcon className="size-4" />
								<p
									className={cn(
										{
											"text-destructive": props.device.power > referenceData.maximumPower,
											"text-warning": props.device.power > referenceData.averagePower,
											"text-primary": props.device.power <= referenceData.averagePower,
										},
										"font-mono font-semibold"
									)}
								>
									{props.device.power.toFixed(2)} Watt
								</p>
							</div>
							<Badge variant={props.device.isPowerEstimated ? "secondary" : "default"}>
								{props.device.isPowerEstimated ? "Geschätzt" : "Manuell vergeben"}
							</Badge>
						</div>
						<p className="text-muted-foreground text-xs">
							Durchschnittliche Leistung für Geräte in dieser Kategorie: {referenceData.averagePower} Watt
						</p>
					</div>
				) : (
					<p className="text-muted-foreground text-sm">
						Um eine Schätzung zu erhalten, müssen sie dieses Gerät Ausschlägen zuordnen oder manuell eine
						Leistung eintragen.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
