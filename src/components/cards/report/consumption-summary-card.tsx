import { ZapIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
	totalConsumption: number;
	avgConsumption: number;
}

export function ConsumptionSummaryCard({ totalConsumption, avgConsumption }: Props) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center gap-2">
				<ZapIcon className="h-5 w-5 text-yellow-500" />
				<CardTitle>Verbrauch</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="flex flex-col">
					<span className="text-muted-foreground text-sm">Gesamt</span>
					<span className="text-2xl font-bold">{totalConsumption.toFixed(2)} kWh</span>
				</div>
				<div className="flex flex-col">
					<span className="text-muted-foreground text-sm">Durchschnitt pro Tag</span>
					<span className="text-xl font-semibold">{avgConsumption.toFixed(2)} kWh</span>
				</div>
			</CardContent>
		</Card>
	);
}
