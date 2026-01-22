import { eachDayOfInterval, format } from "date-fns";
import PageViewsBarChart from "@/components/charts/analytics/page-views-bar-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPageViewSeries } from "@/server/queries/analytics";

interface Props {
	className?: string;
	start: Date;
	end: Date;
	rangeLabel: string;
	userId?: string;
}

export default async function AnalyticsPageViewsCard(props: Props) {
	const series = await getPageViewSeries(props.start, props.end, props.userId);

	const seriesMap = new Map(series.map((point) => [format(point.date, "yyyy-MM-dd"), point]));
	const data = eachDayOfInterval({ start: props.start, end: props.end }).map((day) => {
		const key = format(day, "yyyy-MM-dd");
		const point = seriesMap.get(key);
		return {
			date: day,
			views: point?.views ?? 0,
			users: point?.users ?? 0,
		};
	});

	return (
		<Card className={props.className}>
			<CardHeader>
				<CardTitle>Seitenaufrufe</CardTitle>
				<CardDescription>Zeitraum {props.rangeLabel}.</CardDescription>
			</CardHeader>
			<CardContent>
				{series.length === 0 ? (
					<p className="text-center font-mono font-semibold">Keine Seitenaufrufe im Zeitraum.</p>
				) : (
					<PageViewsBarChart data={data} />
				)}
			</CardContent>
		</Card>
	);
}
