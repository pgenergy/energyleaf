"use client";

import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

export interface ActionEventsDataPoint {
	date: Date;
	success: number;
	failed: number;
}

interface Props {
	data: ActionEventsDataPoint[];
}

const chartConfig = {
	success: {
		label: "Erfolgreich",
		color: "var(--chart-2)",
	},
	failed: {
		label: "Fehlgeschlagen",
		color: "var(--chart-5)",
	},
} satisfies ChartConfig;

export default function ActionEventsBarChart(props: Props) {
	const { chartData, max } = useMemo(() => {
		const prepared = props.data.map((point) => {
			const total = point.success + point.failed;
			return {
				date: format(point.date, "dd.MM", { locale: de }),
				success: point.success,
				failed: point.failed,
				total,
			};
		});
		const maxValue = prepared.length > 0 ? Math.max(...prepared.map((point) => point.total)) : 0;
		return {
			chartData: prepared,
			max: maxValue,
		};
	}, [props.data]);

	return (
		<ChartContainer className="min-h-56 max-h-96 w-full" config={chartConfig}>
			<BarChart
				accessibilityLayer
				data={chartData}
				className="select-none"
				margin={{
					top: 16,
					right: 10,
					left: 10,
					bottom: 16,
				}}
			>
				<ChartLegend content={<ChartLegendContent />} />
				<ChartTooltip content={<ChartTooltipContent />} />
				<YAxis type="number" interval="preserveStartEnd" domain={[0, max]} />
				<XAxis dataKey="date" type="category" interval="equidistantPreserveStart" />
				<Bar dataKey="success" fill="var(--color-success)" radius={6} stackId="actions" />
				<Bar dataKey="failed" fill="var(--color-failed)" radius={6} stackId="actions" />
			</BarChart>
		</ChartContainer>
	);
}
