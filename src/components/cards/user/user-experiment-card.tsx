import { FlaskConicalIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserExperimentDataByUserId } from "@/server/queries/user";

interface Props {
	userId: string;
}

function formatDate(date: Date | null): string {
	if (!date) return "-";
	return date.toLocaleDateString("de-DE", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

function formatExperimentStatus(status: string | null): string {
	if (!status) return "-";
	const statusMap: Record<string, string> = {
		registered: "Registriert",
		approved: "Genehmigt",
		dismissed: "Abgelehnt",
		exported: "Exportiert",
		first_survey: "Erste Umfrage",
		first_finished: "Erste Phase abgeschlossen",
		installation: "Installation",
		second_survey: "Zweite Umfrage",
		second_finished: "Zweite Phase abgeschlossen",
		third_survey: "Dritte Umfrage",
		third_finished: "Dritte Phase abgeschlossen",
		deinstallation: "Deinstallation",
		inactive: "Inaktiv",
	};
	return statusMap[status] ?? status;
}

export default async function UserExperimentCard({ userId }: Props) {
	const experimentData = await getUserExperimentDataByUserId(userId);

	if (!experimentData) {
		return (
			<Card>
				<CardHeader>
					<div className="flex flex-row items-center gap-3">
						<FlaskConicalIcon className="size-5" />
						<div className="flex min-w-0 flex-col">
							<CardTitle>Experiment</CardTitle>
							<CardDescription>Experimentdaten</CardDescription>
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
					<FlaskConicalIcon className="size-5" />
					<div className="flex min-w-0 flex-col">
						<CardTitle>Experiment</CardTitle>
						<CardDescription>Experimentdaten</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div>
						<span className="text-muted-foreground">Status:</span>
						<p>{formatExperimentStatus(experimentData.experimentStatus)}</p>
					</div>
					<div>
						<span className="text-muted-foreground">Experiment-Nr.:</span>
						<p>{experimentData.experimentNumber ?? "-"}</p>
					</div>
					<div>
						<span className="text-muted-foreground">Installationsdatum:</span>
						<p>{formatDate(experimentData.installationDate)}</p>
					</div>
					<div>
						<span className="text-muted-foreground">Deinstallationsdatum:</span>
						<p>{formatDate(experimentData.deinstallationDate)}</p>
					</div>
				</div>
				<div className="flex flex-row flex-wrap items-center gap-2">
					<Badge variant={experimentData.getsPaid ? "default" : "secondary"}>
						{experimentData.getsPaid ? "Vergütung" : "Keine Vergütung"}
					</Badge>
					<Badge variant={experimentData.usesProlific ? "default" : "secondary"}>
						{experimentData.usesProlific ? "Prolific" : "Kein Prolific"}
					</Badge>
				</div>
			</CardContent>
		</Card>
	);
}
