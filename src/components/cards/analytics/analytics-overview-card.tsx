import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getActionOverview, getPageViewOverview } from "@/server/queries/analytics";

const numberFormatter = new Intl.NumberFormat("de-DE");

interface Props {
	className?: string;
	start: Date;
	end: Date;
	rangeLabel: string;
	userId?: string;
}

interface StatProps {
	label: string;
	value: number;
}

function Stat(props: StatProps) {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-xs text-muted-foreground">{props.label}</span>
			<span className="text-lg font-semibold">{numberFormatter.format(props.value)}</span>
		</div>
	);
}

export default async function AnalyticsOverviewCard(props: Props) {
	const [pageViews, actions] = await Promise.all([
		getPageViewOverview(props.start, props.end, props.userId),
		getActionOverview(props.start, props.end, props.userId),
	]);

	return (
		<Card className={props.className}>
			<CardHeader>
				<CardTitle>Übersicht</CardTitle>
				<CardDescription>Aktivität im Zeitraum {props.rangeLabel}.</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="border-border/50 rounded-lg border p-4">
						<p className="text-sm font-semibold">Seitenaufrufe</p>
						<div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
							<Stat label="Aufrufe" value={pageViews.total} />
							<Stat label="Nutzer" value={pageViews.uniqueUsers} />
							<Stat label="Sessions" value={pageViews.uniqueSessions} />
						</div>
					</div>
					<div className="border-border/50 rounded-lg border p-4">
						<p className="text-sm font-semibold">Aktionen</p>
						<div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
							<Stat label="Aktionen" value={actions.total} />
							<Stat label="Erfolgreich" value={actions.success} />
							<Stat label="Fehlgeschlagen" value={actions.failed} />
							<Stat label="Nutzer" value={actions.uniqueUsers} />
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
