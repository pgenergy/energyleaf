import { EuroIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
	totalCost: number;
	avgCost: number;
}

export function CostSummaryCard({ totalCost, avgCost }: Props) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center gap-2">
				<EuroIcon className="h-5 w-5 text-green-500" />
				<CardTitle>Kosten</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="flex flex-col">
					<span className="text-muted-foreground text-sm">Gesamt</span>
					<span className="text-2xl font-bold">{totalCost.toFixed(2)} €</span>
				</div>
				<div className="flex flex-col">
					<span className="text-muted-foreground text-sm">Durchschnitt pro Tag</span>
					<span className="text-xl font-semibold">{avgCost.toFixed(2)} €</span>
				</div>
			</CardContent>
		</Card>
	);
}
