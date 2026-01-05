import { LightbulbIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HintStageTypeDisplay, type HintStageTypeValue } from "@/lib/enums";
import { getHintConfig } from "@/server/queries/hints";

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

export default async function UserHintConfigCard({ userId }: Props) {
	const config = await getHintConfig(userId);

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-row items-center gap-3">
					<LightbulbIcon className="size-5" />
					<div className="flex min-w-0 flex-col">
						<CardTitle>Hinweise</CardTitle>
						<CardDescription>Hinweis-Stufe und Fortschritt</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{config ? (
					<>
						<div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
							<div>
								<span className="text-muted-foreground">Aktuelle Stufe:</span>
								<p>{HintStageTypeDisplay[config.stage as HintStageTypeValue]}</p>
							</div>
							<div>
								<span className="text-muted-foreground">Stufe gestartet am:</span>
								<p>{formatDate(config.stageStartedAt)}</p>
							</div>
							<div>
								<span className="text-muted-foreground">Tage in aktueller Stufe:</span>
								<p>{config.hintsDaysSeenInStage}</p>
							</div>
						</div>
						<div className="flex flex-row flex-wrap items-center gap-2">
							<Badge variant={config.hintsEnabled ? "default" : "secondary"}>
								{config.hintsEnabled ? "Hinweise aktiviert" : "Hinweise deaktiviert"}
							</Badge>
						</div>
					</>
				) : (
					<p className="text-muted-foreground text-sm">
						Keine Hinweis-Konfiguration vorhanden. Standardwerte werden verwendet.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
