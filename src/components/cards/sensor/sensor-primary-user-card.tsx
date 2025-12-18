import { UserIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
					<div className="text-sm">
						<p>
							<span className="text-muted-foreground">Benutzername:</span> {user.username || "-"}
						</p>
						<p>
							<span className="text-muted-foreground">E-Mail:</span> {user.email}
						</p>
					</div>
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
