"use client";

import { ClockIcon, MoreVerticalIcon, PencilIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteTouTariffTemplateAction } from "@/server/actions/templates";
import type { TouTariffTemplate } from "@/server/db/tables/templates";

interface Props {
	template: TouTariffTemplate;
}

export default function TouTemplateCard({ template }: Props) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();

	function handleDelete() {
		startTransition(async () => {
			const toastId = toast.loading("Löschen...", { duration: Infinity });
			const res = await deleteTouTariffTemplateAction(template.id);
			if (!res.success) {
				toast.error(res.message, { id: toastId, duration: 4000 });
			} else {
				toast.success(res.message, { id: toastId, duration: 4000 });
				router.refresh();
			}
		});
	}

	const zoneCount = template.zones.length;
	const weekdayOverrides = Object.values(template.weekdayZones).filter(
		(zones) => zones !== null && zones !== undefined,
	).length;

	return (
		<Card className="col-span-1 overflow-hidden">
			<CardHeader>
				<div className="flex flex-row items-center justify-between gap-2">
					<div className="flex min-w-0 flex-col gap-1">
						<CardTitle className="flex items-center gap-2">
							<ClockIcon className="size-4" />
							<span className="truncate">{template.name}</span>
						</CardTitle>
						{template.description && (
							<CardDescription className="line-clamp-2">{template.description}</CardDescription>
						)}
					</div>
					<div className="flex shrink-0 flex-row items-center gap-2">
						<Badge variant={template.isActive ? "default" : "secondary"}>
							{template.isActive ? "Aktiv" : "Inaktiv"}
						</Badge>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="cursor-pointer">
									<MoreVerticalIcon className="size-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem asChild>
									<Link
										href={`/admin/settings/tou-templates/${template.id}/edit`}
										className="cursor-pointer"
									>
										<PencilIcon className="mr-2 size-4" />
										Bearbeiten
									</Link>
								</DropdownMenuItem>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<DropdownMenuItem
											className="cursor-pointer text-destructive focus:text-destructive"
											onSelect={(e) => e.preventDefault()}
										>
											<TrashIcon className="mr-2 size-4" />
											Löschen
										</DropdownMenuItem>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Vorlage löschen?</AlertDialogTitle>
											<AlertDialogDescription>
												Sind Sie sicher, dass Sie die Vorlage "{template.name}" löschen möchten?
												Diese Aktion kann nicht rückgängig gemacht werden.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel className="cursor-pointer">Abbrechen</AlertDialogCancel>
											<AlertDialogAction
												onClick={handleDelete}
												disabled={pending}
												className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
											>
												{pending ? "Löschen..." : "Löschen"}
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				<div className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<span className="text-muted-foreground">Grundpreis:</span>
						<span className="ml-2 font-medium">{template.basePrice.toFixed(2)} €/Monat</span>
					</div>
					<div>
						<span className="text-muted-foreground">Standardpreis:</span>
						<span className="ml-2 font-medium">{template.standardPrice.toFixed(2)} ct/kWh</span>
					</div>
				</div>
				<div className="flex flex-row flex-wrap items-center gap-2">
					<Badge variant="outline">{zoneCount} Preiszone(n)</Badge>
					{weekdayOverrides > 0 && (
						<Badge variant="outline">{weekdayOverrides} Wochentag-Überschreibung(en)</Badge>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
