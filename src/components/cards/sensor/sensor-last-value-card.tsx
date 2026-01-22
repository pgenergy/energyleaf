import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ClockIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
	lastEntry: {
		timestamp: Date;
	} | null;
}

export default function SensorLastValueCard(props: Props) {
	const lastSeen = props.lastEntry?.timestamp ? format(props.lastEntry.timestamp, "PPpp", { locale: de }) : null;

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-row items-center gap-3">
					<ClockIcon className="size-5" />
					<div className="flex min-w-0 flex-col">
						<CardTitle>Letzter Messwert</CardTitle>
						<CardDescription>Zuletzt gesendete Daten.</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{lastSeen ? (
					<p className="text-sm font-medium">{lastSeen}</p>
				) : (
					<p className="text-muted-foreground text-sm">Keine Messwerte vorhanden</p>
				)}
			</CardContent>
		</Card>
	);
}
