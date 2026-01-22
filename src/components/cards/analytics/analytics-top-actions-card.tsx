import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTopActionTypes } from "@/server/queries/analytics";

const numberFormatter = new Intl.NumberFormat("de-DE");

interface Props {
	className?: string;
	start: Date;
	end: Date;
	rangeLabel: string;
	userId?: string;
}

function formatActionName(action: string) {
	return action.replace(/_action$/, "").replace(/_/g, " ");
}

export default async function AnalyticsTopActionsCard(props: Props) {
	const actions = await getTopActionTypes(props.start, props.end, 8, props.userId);

	return (
		<Card className={props.className}>
			<CardHeader>
				<CardTitle>Top-Aktionen</CardTitle>
				<CardDescription>Häufigste Nutzeraktionen im Zeitraum {props.rangeLabel}.</CardDescription>
			</CardHeader>
			<CardContent>
				{actions.length === 0 ? (
					<p className="text-center font-mono font-semibold">Keine Aktionen vorhanden.</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Aktion</TableHead>
								<TableHead className="text-right">Gesamt</TableHead>
								<TableHead className="text-right">Erfolg</TableHead>
								<TableHead className="text-right">Nutzer</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{actions.map((action) => {
								const successRate =
									action.total > 0 ? Math.round((action.success / action.total) * 100) : 0;
								return (
									<TableRow key={action.action}>
										<TableCell className="max-w-52 truncate font-mono text-xs">
											{formatActionName(action.action)}
										</TableCell>
										<TableCell className="text-right">
											{numberFormatter.format(action.total)}
										</TableCell>
										<TableCell className="text-right">{successRate}%</TableCell>
										<TableCell className="text-right">
											{numberFormatter.format(action.uniqueUsers)}
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}
