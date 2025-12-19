import { KeyIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserFullById } from "@/server/queries/user";

interface Props {
	userId: string;
	experimentMode: boolean;
}

function formatDate(date: Date | null): string {
	if (!date) return "-";
	return date.toLocaleDateString("de-DE", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export default async function UserAccountCard({ userId, experimentMode }: Props) {
	const user = await getUserFullById(userId);

	if (!user) {
		return (
			<Card>
				<CardHeader>
					<div className="flex flex-row items-center gap-3">
						<KeyIcon className="size-5" />
						<div className="flex min-w-0 flex-col">
							<CardTitle>Kontostatus</CardTitle>
							<CardDescription>Status und Berechtigungen</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">Keine Daten vorhanden</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-row items-center gap-3">
					<KeyIcon className="size-5" />
					<div className="flex min-w-0 flex-col">
						<CardTitle>Kontostatus</CardTitle>
						<CardDescription>Status und Berechtigungen</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div>
						<span className="text-muted-foreground">Erstellt am:</span>
						<p>{formatDate(user.created)}</p>
					</div>
					<div>
						<span className="text-muted-foreground">Aktiviert am:</span>
						<p>{formatDate(user.activationDate)}</p>
					</div>
					<div>
						<span className="text-muted-foreground">Onboarding:</span>
						<p>{user.onboardingCompleted ? "Abgeschlossen" : "Nicht abgeschlossen"}</p>
					</div>
					<div>
						<span className="text-muted-foreground">Simulation:</span>
						<p>{user.isSimulationFree ? "Aktiviert" : "Deaktiviert"}</p>
					</div>
				</div>
				<div className="flex flex-row flex-wrap items-center gap-2">
					<Badge variant={user.isActive ? "default" : "secondary"}>
						{user.isActive ? "Aktiv" : "Inaktiv"}
					</Badge>
					{user.isAdmin && <Badge variant="outline">Admin</Badge>}
					{experimentMode && user.isParticipant && <Badge variant="secondary">Teilnehmer</Badge>}
				</div>
			</CardContent>
		</Card>
	);
}
