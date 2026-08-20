"use client";

import { format, getWeekOfMonth } from "date-fns";
import { de } from "date-fns/locale";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

export interface SolarProductionPoint {
	timestamp: Date;
	production: number;
}

interface Props {
	data: SolarProductionPoint[];
	compareData?: SolarProductionPoint[];
	dateFormat: "hour" | "weekday" | "week";
}

function formatTimestamp(timestamp: Date, dateFormat: Props["dateFormat"]) {
	if (dateFormat === "hour") {
		return `${format(timestamp, "HH", { locale: de })} Uhr`;
	}

	if (dateFormat === "weekday") {
		return format(timestamp, "EEEEEE", { locale: de });
	}

	return `Woche ${getWeekOfMonth(timestamp, { weekStartsOn: 1 })}`;
}

export default function SolarProductionChart({ data, compareData, dateFormat }: Props) {
	const preparedData = useMemo(() => {
		const current = new Map(data.map((point) => [formatTimestamp(point.timestamp, dateFormat), point.production]));

		if (!compareData) {
			return Array.from(current, ([timestamp, production]) => ({ timestamp, production }));
		}

		const comparison = new Map(
			compareData.map((point) => [formatTimestamp(point.timestamp, dateFormat), point.production]),
		);
		const timestamps = new Set([...current.keys(), ...comparison.keys()]);

		return Array.from(timestamps, (timestamp) => ({
			production: current.get(timestamp),
			productionCompare: comparison.get(timestamp),
			timestamp,
		}));
	}, [compareData, data, dateFormat]);

	const config = {
		production: {
			label: "Einspeisung (kWh)",
			color: "var(--chart-4)",
		},
		productionCompare: {
			label: "Vergleich: Einspeisung (kWh)",
			color: "var(--chart-1)",
		},
	};

	const maxValue = Math.max(
		0,
		...data.map((point) => point.production),
		...(compareData?.map((point) => point.production) ?? []),
	);

	return (
		<ChartContainer className="min-h-56 max-h-96 w-full" config={config}>
			<BarChart
				accessibilityLayer
				data={preparedData}
				className="select-none"
				margin={{ top: 16, right: 10, left: 10, bottom: 16 }}
			>
				<CartesianGrid vertical={false} />
				<ChartLegend content={<ChartLegendContent />} />
				<ChartTooltip
					content={
						<ChartTooltipContent
							formatter={(value, name) => (
								<div className="flex min-w-40 items-center justify-between gap-3">
									<span className="text-muted-foreground">
										{config[name as keyof typeof config]?.label}
									</span>
									<span className="font-mono font-medium tabular-nums">
										{Number(value).toFixed(3)} kWh
									</span>
								</div>
							)}
						/>
					}
				/>
				<YAxis
					dataKey="production"
					type="number"
					tickLine={false}
					axisLine={false}
					domain={[0, maxValue]}
					unit=" kWh"
				/>
				<XAxis dataKey="timestamp" type="category" tickLine={false} axisLine={false} />
				<Bar dataKey="production" fill="var(--color-production)" radius={[6, 6, 0, 0]} />
				{compareData ? (
					<Bar dataKey="productionCompare" fill="var(--color-productionCompare)" radius={[6, 6, 0, 0]} />
				) : null}
			</BarChart>
		</ChartContainer>
	);
}
