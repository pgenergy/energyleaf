"use client";

import { Loader2Icon, TrashIcon, UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addAdditionalSensorUserAction, removeAdditionalSensorUserAction } from "@/server/actions/sensor";
import type { AdditionalUserForSensor } from "@/server/queries/sensor";
import type { UserForSelect } from "@/server/queries/user";

interface Props {
	sensor: {
		id: string;
		userId: string | null;
	};
	additionalUsers: AdditionalUserForSensor[];
	allUsers: UserForSelect[];
}

export default function SensorAdditionalUsersCard({ sensor, additionalUsers, allUsers }: Props) {
	const router = useRouter();
	const [selectedUserId, setSelectedUserId] = useState<string>("");
	const [isAdding, setIsAdding] = useState(false);
	const [removingUserId, setRemovingUserId] = useState<string | null>(null);

	// Filter out users who are already primary or additional users
	const additionalUserIds = new Set(additionalUsers.map((u) => u.id));
	const availableUsers = allUsers.filter((u) => u.id !== sensor.userId && !additionalUserIds.has(u.id));

	const handleAddUser = async () => {
		if (!selectedUserId) return;

		setIsAdding(true);
		const toastId = toast.loading("Nutzer wird hinzugefügt...", { duration: Infinity });

		const res = await addAdditionalSensorUserAction(sensor.id, selectedUserId);

		if (res.success) {
			toast.success(res.message, { id: toastId, duration: 4000 });
			setSelectedUserId("");
			router.refresh();
		} else {
			toast.error(res.message, { id: toastId, duration: 4000 });
		}

		setIsAdding(false);
	};

	const handleRemoveUser = async (userId: string) => {
		setRemovingUserId(userId);
		const toastId = toast.loading("Nutzer wird entfernt...", { duration: Infinity });

		const res = await removeAdditionalSensorUserAction(sensor.id, userId);

		if (res.success) {
			toast.success(res.message, { id: toastId, duration: 4000 });
			router.refresh();
		} else {
			toast.error(res.message, { id: toastId, duration: 4000 });
		}

		setRemovingUserId(null);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-row items-center gap-3">
					<UsersIcon className="size-5" />
					<div className="flex min-w-0 flex-col">
						<CardTitle>Zusätzliche Nutzer</CardTitle>
						<CardDescription>Weitere Nutzer mit Zugriff auf den Sensor</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{additionalUsers.length > 0 ? (
					<ul className="flex flex-col gap-2">
						{additionalUsers.map((user) => (
							<li
								key={user.id}
								className="flex flex-row items-center justify-between rounded-md border p-2"
							>
								<div className="text-sm">
									<p className="font-medium">{user.username || "-"}</p>
									<p className="text-muted-foreground text-xs">{user.email}</p>
								</div>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => handleRemoveUser(user.id)}
									disabled={removingUserId === user.id}
									className="cursor-pointer text-destructive hover:text-destructive"
								>
									{removingUserId === user.id ? (
										<Loader2Icon className="size-4 animate-spin" />
									) : (
										<TrashIcon className="size-4" />
									)}
								</Button>
							</li>
						))}
					</ul>
				) : (
					<p className="text-muted-foreground text-sm">Keine zusätzlichen Nutzer zugewiesen</p>
				)}

				{availableUsers.length > 0 && (
					<div className="flex flex-row items-center gap-2">
						<Select value={selectedUserId} onValueChange={setSelectedUserId}>
							<SelectTrigger className="flex-1">
								<SelectValue placeholder="Nutzer auswählen..." />
							</SelectTrigger>
							<SelectContent>
								{availableUsers.map((user) => (
									<SelectItem key={user.id} value={user.id}>
										{user.username} ({user.email})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button
							onClick={handleAddUser}
							disabled={!selectedUserId || isAdding}
							className="cursor-pointer"
						>
							{isAdding ? <Loader2Icon className="size-4 animate-spin" /> : "Hinzufügen"}
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
