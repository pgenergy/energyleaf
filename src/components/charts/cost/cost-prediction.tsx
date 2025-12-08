"use client";

import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import type { EnergyDataWithCost } from "@/server/lib/cost";

interface Props {
	data: EnergyDataWithCost[];
	predictionData: { cost: number; timestamp: Date }[];
}

const config = {
	name: {
		label: "Kosten (€)",
	},
	cost: {
		label: "Kosten (€)",
		color: "var(--primary)",
	},
	predictionCost: {
		label: "Kostenvorhersage (€)",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

export default function CostPredictionChart(props: Props) {
	const preparedData = useMemo(() => {
		const data: { cost: number | null; predictionCost: number | null; timestamp: string }[] = [];
		let cost = 0;
		for (let i = 0; i < props.data.length; i++) {
			const d = props.data[i];
			const isLast = i === props.data.length - 1;
			data.push({
				cost: cost + d.cost,
				predictionCost: isLast ? cost + d.cost : null,
				timestamp: format(d.timestamp, "dd", {
					locale: de,
				}),
			});
			cost += d.cost;
		}

		for (let i = 0; i < props.predictionData.length; i++) {
			const d = props.predictionData[i];
			data.push({
				cost: null,
				predictionCost: cost + d.cost,
				timestamp: format(d.timestamp, "dd", {
					locale: de,
				}),
			});
			cost += d.cost;
		}

		return data;
	}, [props.data, props.predictionData]);
	return (
		<ChartContainer className="min-h-56 w-full" config={config}>
			<LineChart
				accessibilityLayer
				data={preparedData}
				margin={{
					top: 16,
					right: 10,
					left: 10,
					bottom: 16,
				}}
			>
				<CartesianGrid vertical={false} />
				<ChartLegend content={<ChartLegendContent />} />
				<XAxis
					dataKey="timestamp"
					tickLine={true}
					axisLine={true}
					tickMargin={8}
					interval="equidistantPreserveStart"
				/>
				<YAxis
					dataKey="predictionCost"
					tickLine={true}
					axisLine={true}
					tickMargin={8}
					interval="equidistantPreserveStart"
				/>
				<ChartTooltip cursor={false} content={<ChartTooltipContent labelKey="name" />} />
				<Line dataKey="cost" type="stepAfter" stroke="var(--color-cost)" strokeWidth={2} dot={false} />
				<Line
					dataKey="predictionCost"
					type="stepAfter"
					stroke="var(--color-predictionCost)"
					strokeWidth={2}
					dot={false}
					strokeDasharray="4 4"
				/>
			</LineChart>
		</ChartContainer>
	);
}
