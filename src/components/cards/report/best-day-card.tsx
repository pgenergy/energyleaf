import { format } from "date-fns";
import { de } from "date-fns/locale";
import { TrophyIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
	timestamp: string;
	consumption: number;
}

export function BestDayCard({ timestamp, consumption }: Props) {
	const date = new Date(timestamp);

	return (
		<Card>
			<CardHeader className="flex flex-row items-center gap-2">
				<TrophyIcon className="h-5 w-5 text-amber-500" />
				<CardTitle>Bester Tag</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-2">
				<span className="text-lg font-semibold">{format(date, "EEEE, PPP", { locale: de })}</span>
				<span className="text-muted-foreground text-sm">
					Niedrigster Verbrauch: {consumption.toFixed(2)} kWh
				</span>
			</CardContent>
		</Card>
	);
}
