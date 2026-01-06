"use client";

import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useMemo } from "react";
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, XAxis, YAxis } from "recharts";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import type { EnergyDataWithCost, PredictionResult } from "@/server/lib/cost";

interface Props {
	data: EnergyDataWithCost[];
	predictionData: PredictionResult[];
	budgetPerDay?: number | null;
	monthlyBudget?: number | null;
}

const config = {
	name: {
		label: "Kosten (€)",
	},
	cost: {
		label: "Kosten (€)",
		color: "var(--chart-2)",
	},
	predictionCost: {
		label: "Kostenvorhersage (€)",
		color: "var(--chart-1)",
	},
	budgetCost: {
		label: "Budget (€)",
		color: "var(--chart-5)",
	},
} satisfies ChartConfig;

export default function CostPredictionChart({ data, predictionData, budgetPerDay, monthlyBudget }: Props) {
	const preparedData = useMemo(() => {
		const chartData: {
			cost: number | null;
			predictionCost: number | null;
			predictionRange: [number, number] | null;
			budgetCost: number | null;
			timestamp: string;
		}[] = [];
		let cost = 0;
		let budgetCumulative = 0;

		// Process actual data
		for (let i = 0; i < data.length; i++) {
			const d = data[i];
			const isLast = i === data.length - 1;
			cost += d.cost;
			budgetCumulative += budgetPerDay ?? 0;

			chartData.push({
				cost: cost,
				predictionCost: isLast ? cost : null,
				predictionRange: null,
				budgetCost: budgetPerDay ? budgetCumulative : null,
				timestamp: format(d.timestamp, "dd", {
					locale: de,
				}),
			});
		}

		// Track cumulative prediction costs for min/max bands
		let predictionCostCumulative = cost;
		let predictionCostMinCumulative = cost;
		let predictionCostMaxCumulative = cost;

		// Process prediction data
		for (let i = 0; i < predictionData.length; i++) {
			const d = predictionData[i];
			predictionCostCumulative += d.cost;
			predictionCostMinCumulative += d.costMin;
			predictionCostMaxCumulative += d.costMax;
			budgetCumulative += budgetPerDay ?? 0;

			chartData.push({
				cost: null,
				predictionCost: predictionCostCumulative,
				predictionRange: [predictionCostMinCumulative, predictionCostMaxCumulative],
				budgetCost: budgetPerDay ? budgetCumulative : null,
				timestamp: format(d.timestamp, "dd", {
					locale: de,
				}),
			});
		}

		return chartData;
	}, [data, predictionData, budgetPerDay]);

	// Calculate Y-axis domain to include budget line if present
	const yAxisDomain = useMemo(() => {
		const allValues = preparedData.flatMap((d) => {
			const values: number[] = [];
			if (d.cost !== null) values.push(d.cost);
			if (d.predictionCost !== null) values.push(d.predictionCost);
			if (d.predictionRange !== null) values.push(d.predictionRange[1]);
			if (d.budgetCost !== null) values.push(d.budgetCost);
			return values;
		});
		const maxValue = Math.max(...allValues, monthlyBudget ?? 0);
		return [0, Math.ceil(maxValue * 1.1)];
	}, [preparedData, monthlyBudget]);

	return (
		<ChartContainer className="min-h-64 w-full" config={config}>
			<ComposedChart
				accessibilityLayer
				data={preparedData}
				margin={{
					top: 16,
					right: 10,
					left: 10,
					bottom: 16,
				}}
			>
				<CartesianGrid vertical={false} strokeOpacity={0.3} />
				<ChartLegend content={<ChartLegendContent />} />
				<XAxis
					dataKey="timestamp"
					tickLine={true}
					axisLine={true}
					tickMargin={8}
					interval="equidistantPreserveStart"
				/>
				<YAxis
					domain={yAxisDomain}
					tickLine={true}
					axisLine={true}
					tickMargin={8}
					interval="equidistantPreserveStart"
					tickFormatter={(value: number) => `${value.toFixed(0)} €`}
				/>
				<ChartTooltip
					cursor={false}
					content={
						<ChartTooltipContent
							labelKey="name"
							formatter={(value, name) => {
								if (name === "predictionRange") {
									const range = value as [number, number];
									return (
										<span>
											Bereich: {range[0].toFixed(2)} - {range[1].toFixed(2)} €
										</span>
									);
								}
								const label =
									name === "cost"
										? "Kosten"
										: name === "predictionCost"
											? "Vorhersage"
											: name === "budgetCost"
												? "Budget"
												: String(name);
								return (
									<span>
										{label}: {Number(value).toFixed(2)} €
									</span>
								);
							}}
						/>
					}
				/>

				<Area
					dataKey="predictionRange"
					type="stepAfter"
					fill="var(--color-predictionCost)"
					fillOpacity={0.2}
					stroke="var(--color-predictionCost)"
					strokeOpacity={0.3}
					strokeWidth={1}
					connectNulls={false}
					legendType="none"
				/>

				{budgetPerDay && (
					<Line
						dataKey="budgetCost"
						type="stepAfter"
						stroke="var(--color-budgetCost)"
						strokeWidth={2}
						dot={false}
						strokeDasharray="8 4"
					/>
				)}

				{monthlyBudget && (
					<ReferenceLine
						y={monthlyBudget}
						stroke="var(--color-budgetCost)"
						strokeDasharray="4 4"
						strokeWidth={1}
						label={{
							value: `Budget: ${monthlyBudget.toFixed(0)} €`,
							position: "insideTopLeft",
							fill: "var(--color-budgetCost)",
							fontSize: 11,
						}}
					/>
				)}

				<Line dataKey="cost" type="stepAfter" stroke="var(--color-cost)" strokeWidth={2.5} dot={false} />

				<Line
					dataKey="predictionCost"
					type="stepAfter"
					stroke="var(--color-predictionCost)"
					strokeWidth={2}
					dot={false}
					strokeDasharray="4 4"
				/>
			</ComposedChart>
		</ChartContainer>
	);
}
