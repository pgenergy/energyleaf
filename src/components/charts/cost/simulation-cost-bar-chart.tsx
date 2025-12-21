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

export interface CostDataPoint {
	timestamp: Date;
	standardCost: number;
	touCost?: number;
}

type DisplayMode = "all" | "sim-only" | "tou-only" | "original-only";

interface Props {
	originalData: CostDataPoint[];
	simData: CostDataPoint[];
	showTou: boolean;
	hasSimulation: boolean;
}

// Case 4: All 4 bars (TOU + Simulation)
const allBarsConfig = {
	orgStandard: {
		label: "Originaldaten (€)",
		color: "var(--primary)",
	},
	orgTou: {
		label: "Originaldaten mit Zeittarif (€)",
		color: "var(--chart-3)",
	},
	simStandard: {
		label: "Simulation (€)",
		color: "var(--chart-4)",
	},
	simTou: {
		label: "Simulation mit Zeittarif (€)",
		color: "var(--chart-5)",
	},
} satisfies ChartConfig;

// Case 1: Original vs Simulation (no TOU)
const simOnlyConfig = {
	orgStandard: {
		label: "Originaldaten (€)",
		color: "var(--primary)",
	},
	simStandard: {
		label: "Simulation (€)",
		color: "var(--chart-4)",
	},
} satisfies ChartConfig;

// Case 2: Original vs Original TOU (no simulation effects)
const touOnlyConfig = {
	orgStandard: {
		label: "Standardtarif (€)",
		color: "var(--primary)",
	},
	orgTou: {
		label: "Zeittarif (€)",
		color: "var(--chart-3)",
	},
} satisfies ChartConfig;

// Case 3: Original only (no TOU, no simulation effects)
const originalOnlyConfig = {
	orgStandard: {
		label: "Kosten (€)",
		color: "var(--primary)",
	},
} satisfies ChartConfig;

function getDisplayMode(showTou: boolean, hasSimulation: boolean): DisplayMode {
	if (showTou && hasSimulation) return "all";
	if (!showTou && hasSimulation) return "sim-only";
	if (showTou && !hasSimulation) return "tou-only";
	return "original-only";
}

function getSubtitle(mode: DisplayMode): string {
	switch (mode) {
		case "all":
			return "Vergleich: Originaldaten und Simulation jeweils mit Standard- und Zeittarif.";
		case "sim-only":
			return "Vergleich: Kosten mit Originaldaten vs. simulierten Daten.";
		case "tou-only":
			return "Vergleich: Kosten mit Standardtarif vs. Zeittarif.";
		case "original-only":
			return "Ihre stündlichen Kosten basierend auf Ihrem Standardtarif.";
	}
}

export default function SimulationCostBarChart(props: Props) {
	const mode = getDisplayMode(props.showTou, props.hasSimulation);

	const { chartData, config, dataKeys } = useMemo(() => {
		const formatTimestamp = (d: Date) => `${format(d, "HH", { locale: de })} Uhr`;

		switch (mode) {
			case "all": {
				const data = props.originalData.map((d, i) => ({
					timestamp: formatTimestamp(d.timestamp),
					orgStandard: Number(d.standardCost.toFixed(2)),
					orgTou: d.touCost !== undefined ? Number(d.touCost.toFixed(2)) : 0,
					simStandard: Number((props.simData[i]?.standardCost ?? 0).toFixed(2)),
					simTou: props.simData[i]?.touCost !== undefined ? Number(props.simData[i].touCost.toFixed(2)) : 0,
				}));
				return {
					chartData: data,
					config: allBarsConfig,
					dataKeys: ["orgStandard", "orgTou", "simStandard", "simTou"] as const,
				};
			}
			case "sim-only": {
				const data = props.originalData.map((d, i) => ({
					timestamp: formatTimestamp(d.timestamp),
					orgStandard: Number(d.standardCost.toFixed(2)),
					simStandard: Number((props.simData[i]?.standardCost ?? 0).toFixed(2)),
				}));
				return {
					chartData: data,
					config: simOnlyConfig,
					dataKeys: ["orgStandard", "simStandard"] as const,
				};
			}
			case "tou-only": {
				const data = props.originalData.map((d) => ({
					timestamp: formatTimestamp(d.timestamp),
					orgStandard: Number(d.standardCost.toFixed(2)),
					orgTou: d.touCost !== undefined ? Number(d.touCost.toFixed(2)) : 0,
				}));
				return {
					chartData: data,
					config: touOnlyConfig,
					dataKeys: ["orgStandard", "orgTou"] as const,
				};
			}
			case "original-only": {
				const data = props.originalData.map((d) => ({
					timestamp: formatTimestamp(d.timestamp),
					orgStandard: Number(d.standardCost.toFixed(2)),
				}));
				return {
					chartData: data,
					config: originalOnlyConfig,
					dataKeys: ["orgStandard"] as const,
				};
			}
		}
	}, [props.originalData, props.simData, mode]);

	const yAxisDomain = useMemo(() => {
		let maxValue = 0;
		for (const d of props.originalData) {
			maxValue = Math.max(maxValue, d.standardCost, d.touCost ?? 0);
		}
		if (props.hasSimulation) {
			for (const d of props.simData) {
				maxValue = Math.max(maxValue, d.standardCost, d.touCost ?? 0);
			}
		}
		return [0, maxValue];
	}, [props.originalData, props.simData, props.hasSimulation]);

	const subtitle = getSubtitle(mode);

	return (
		<div className="flex flex-col gap-4">
			<p className="text-muted-foreground text-sm">{subtitle}</p>
			<ChartContainer className="max-h-96 w-full" config={config}>
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
					<YAxis type="number" interval="preserveStartEnd" domain={yAxisDomain} />
					<XAxis dataKey="timestamp" type="category" interval="equidistantPreserveStart" />
					{dataKeys.map((key) => (
						<Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={8} />
					))}
				</BarChart>
			</ChartContainer>
		</div>
	);
}
