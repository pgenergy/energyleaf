import { UserIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeZoneTypeDisplay, type TimezoneTypeValue } from "@/lib/enums";
import { getSensorForUser, getUserFullById } from "@/server/queries/user";

interface Props {
	userId: string;
}

export default async function UserInfoCard({ userId }: Props) {
	const [user, sensors] = await Promise.all([getUserFullById(userId), getSensorForUser(userId)]);

	if (!user) {
		return (
			<Card>
				<CardHeader>
					<div className="flex flex-row items-center gap-3">
						<UserIcon className="size-5" />
						<div className="flex min-w-0 flex-col">
							<CardTitle>Benutzerinformationen</CardTitle>
							<CardDescription>Allgemeine Informationen zum Nutzer</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">Keine Daten vorhanden</p>
				</CardContent>
			</Card>
		);
	}

	const displayName = user.firstname || user.lastname ? `${user.firstname} ${user.lastname}`.trim() : null;
	const primarySensor = sensors[0];

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-row items-center gap-3">
					<UserIcon className="size-5" />
					<div className="flex min-w-0 flex-col">
						<CardTitle>Benutzerinformationen</CardTitle>
						<CardDescription>Allgemeine Informationen zum Nutzer</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					{displayName && (
						<div>
							<span className="text-muted-foreground">Name:</span>
							<p className="truncate">{displayName}</p>
						</div>
					)}
					<div>
						<span className="text-muted-foreground">Benutzername:</span>
						<p className="truncate">{user.username}</p>
					</div>
					<div>
						<span className="text-muted-foreground">E-Mail:</span>
						<p className="truncate">{user.email}</p>
					</div>
					{user.phone && (
						<div>
							<span className="text-muted-foreground">Telefon:</span>
							<p className="truncate">{user.phone}</p>
						</div>
					)}
					{user.address && (
						<div>
							<span className="text-muted-foreground">Adresse:</span>
							<p className="truncate">{user.address}</p>
						</div>
					)}
					{user.timezone && (
						<div>
							<span className="text-muted-foreground">Zeitzone:</span>
							<p>{TimeZoneTypeDisplay[user.timezone as TimezoneTypeValue] ?? user.timezone}</p>
						</div>
					)}
					<div>
						<span className="text-muted-foreground">Sensor:</span>
						{primarySensor ? (
							<div className="flex flex-col gap-1">
								<Link
									href={`/admin/sensors/${encodeURIComponent(primarySensor.clientId)}`}
									className="truncate font-mono text-sm hover:underline"
								>
									{primarySensor.clientId}
								</Link>
								{sensors.length > 1 && (
									<p className="text-muted-foreground text-xs">+{sensors.length - 1} weitere</p>
								)}
							</div>
						) : (
							<p className="text-muted-foreground">Kein Sensor zugewiesen</p>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
