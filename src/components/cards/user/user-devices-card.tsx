import { LampIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeviceCategoryDisplay, type DeviceCategoryValue } from "@/lib/enums";
import { getDevicesForUser } from "@/server/queries/user";

interface Props {
	userId: string;
}

export default async function UserDevicesCard({ userId }: Props) {
	const devices = await getDevicesForUser(userId);

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-row items-center gap-3">
					<LampIcon className="size-5" />
					<div className="flex min-w-0 flex-col">
						<CardTitle>Geräte</CardTitle>
						<CardDescription>
							{devices.length > 0 ? `${devices.length} Gerät(e)` : "Registrierte Geräte"}
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{devices.length === 0 ? (
					<p className="text-muted-foreground text-sm">Keine Daten vorhanden</p>
				) : (
					<div className="flex flex-col gap-2">
						{devices.map((device) => (
							<div key={device.id} className="flex flex-row items-center justify-between gap-2">
								<span className="truncate text-sm">{device.name}</span>
								<Badge variant="outline">
									{DeviceCategoryDisplay[device.category as DeviceCategoryValue] ?? device.category}
								</Badge>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
