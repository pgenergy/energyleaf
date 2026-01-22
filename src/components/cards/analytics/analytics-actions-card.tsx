import { eachDayOfInterval, format } from "date-fns";
import ActionEventsBarChart from "@/components/charts/analytics/action-events-bar-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getActionSeries } from "@/server/queries/analytics";

interface Props {
	className?: string;
	start: Date;
	end: Date;
	rangeLabel: string;
	userId?: string;
}

export default async function AnalyticsActionsCard(props: Props) {
	const series = await getActionSeries(props.start, props.end, props.userId);

	const seriesMap = new Map(series.map((point) => [format(point.date, "yyyy-MM-dd"), point]));
	const data = eachDayOfInterval({ start: props.start, end: props.end }).map((day) => {
		const key = format(day, "yyyy-MM-dd");
		const point = seriesMap.get(key);
		return {
			date: day,
			success: point?.success ?? 0,
			failed: point?.failed ?? 0,
		};
	});

	return (
		<Card className={props.className}>
			<CardHeader>
				<CardTitle>Aktionen</CardTitle>
				<CardDescription>Zeitraum {props.rangeLabel}.</CardDescription>
			</CardHeader>
			<CardContent>
				{series.length === 0 ? (
					<p className="text-center font-mono font-semibold">Keine Aktionen im Zeitraum.</p>
				) : (
					<ActionEventsBarChart data={data} />
				)}
			</CardContent>
		</Card>
	);
}
