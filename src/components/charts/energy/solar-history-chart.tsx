"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export interface SolarHistoryPoint {
	date: string;
	production: number;
}

export default function SolarHistoryChart({ data }: { data: SolarHistoryPoint[] }) {
	const config = {
		production: {
			label: "Einspeisung (kWh)",
			color: "var(--chart-4)",
		},
	};

	return (
		<ChartContainer className="min-h-56 max-h-80 w-full" config={config}>
			<BarChart data={data} accessibilityLayer margin={{ top: 12, right: 8, left: 8, bottom: 8 }}>
				<CartesianGrid vertical={false} />
				<ChartTooltip
					content={
						<ChartTooltipContent
							formatter={(value) => (
								<div className="flex min-w-36 items-center justify-between gap-3">
									<span className="text-muted-foreground">Einspeisung</span>
									<span className="font-mono font-medium tabular-nums">
										{Number(value).toFixed(2)} kWh
									</span>
								</div>
							)}
						/>
					}
				/>
				<YAxis type="number" tickLine={false} axisLine={false} width={54} unit=" kWh" />
				<XAxis dataKey="date" tickLine={false} axisLine={false} interval="preserveStartEnd" />
				<Bar dataKey="production" fill="var(--color-production)" radius={[6, 6, 0, 0]} />
			</BarChart>
		</ChartContainer>
	);
}
