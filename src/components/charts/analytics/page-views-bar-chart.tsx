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

export interface PageViewsDataPoint {
	date: Date;
	views: number;
	users: number;
}

interface Props {
	data: PageViewsDataPoint[];
}

const chartConfig = {
	views: {
		label: "Seitenaufrufe",
		color: "var(--chart-1)",
	},
	users: {
		label: "Nutzer",
		color: "var(--chart-4)",
	},
} satisfies ChartConfig;

export default function PageViewsBarChart(props: Props) {
	const chartData = useMemo(() => {
		return props.data.map((point) => ({
			date: format(point.date, "dd.MM", { locale: de }),
			views: point.views,
			users: point.users,
		}));
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
				<YAxis type="number" interval="preserveStartEnd" />
				<XAxis dataKey="date" type="category" interval="equidistantPreserveStart" />
				<Bar dataKey="views" fill="var(--color-views)" radius={6} />
				<Bar dataKey="users" fill="var(--color-users)" radius={6} />
			</BarChart>
		</ChartContainer>
	);
}
