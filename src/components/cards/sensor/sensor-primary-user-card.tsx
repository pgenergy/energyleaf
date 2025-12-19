"use client";

import { Loader2Icon, TrashIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { unassignSensorAction } from "@/server/actions/sensor";

interface Props {
	sensor: {
		clientId: string;
		userId: string | null;
	};
	user: {
		id: string;
		username: string | null;
		email: string;
	} | null;
}

export default function SensorPrimaryUserCard({ sensor, user }: Props) {
	const router = useRouter();
	const [isRemoving, setIsRemoving] = useState(false);

	const handleRemoveUser = async () => {
		setIsRemoving(true);
		const toastId = toast.loading("Nutzer wird entfernt...", { duration: Infinity });

		const res = await unassignSensorAction(sensor.clientId);

		if (res.success) {
			toast.success(res.message, { id: toastId, duration: 4000 });
			router.refresh();
		} else {
			toast.error(res.message, { id: toastId, duration: 4000 });
		}

		setIsRemoving(false);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-row items-center gap-3">
					<UserIcon className="size-5" />
					<div className="flex min-w-0 flex-col">
						<CardTitle>Primärer Nutzer</CardTitle>
						<CardDescription>Hauptnutzer des Sensors</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{user ? (
					<>
						<div className="text-sm">
							<p>
								<span className="text-muted-foreground">Benutzername:</span> {user.username || "-"}
							</p>
							<p>
								<span className="text-muted-foreground">E-Mail:</span> {user.email}
							</p>
						</div>
						<Button
							variant="destructive"
							onClick={handleRemoveUser}
							disabled={isRemoving}
							className="w-fit cursor-pointer"
						>
							{isRemoving ? (
								<Loader2Icon className="mr-2 size-4 animate-spin" />
							) : (
								<TrashIcon className="mr-2 size-4" />
							)}
							Nutzer entfernen
						</Button>
					</>
				) : (
					<>
						<p className="text-muted-foreground text-sm">Kein Nutzer zugewiesen</p>
						<Button asChild className="w-fit cursor-pointer">
							<Link href={`/admin/sensors/${encodeURIComponent(sensor.clientId)}/assign`}>
								Nutzer zuweisen
							</Link>
						</Button>
					</>
				)}
			</CardContent>
		</Card>
	);
}
