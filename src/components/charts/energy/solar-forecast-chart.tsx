"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { SolarForecastHour } from "@/server/queries/weather";

export default function SolarForecastChart({ data }: { data: SolarForecastHour[] }) {
	const preparedData = data.map((point) => ({
		...point,
		hourLabel: `${point.hour.toString().padStart(2, "0")}:00`,
	}));
	const config = {
		production: {
			label: "Prognose (kWh)",
			color: "var(--chart-4)",
		},
	};

	return (
		<ChartContainer className="min-h-56 max-h-80 w-full" config={config}>
			<AreaChart data={preparedData} accessibilityLayer margin={{ top: 12, right: 8, left: 8, bottom: 8 }}>
				<defs>
					<linearGradient id="solarForecastFill" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="var(--color-production)" stopOpacity={0.8} />
						<stop offset="95%" stopColor="var(--color-production)" stopOpacity={0.08} />
					</linearGradient>
				</defs>
				<CartesianGrid vertical={false} />
				<ChartTooltip
					content={
						<ChartTooltipContent
							formatter={(value) => (
								<div className="flex min-w-36 items-center justify-between gap-3">
									<span className="text-muted-foreground">Prognose</span>
									<span className="font-mono font-medium tabular-nums">
										{Number(value).toFixed(2)} kWh
									</span>
								</div>
							)}
						/>
					}
				/>
				<YAxis type="number" tickLine={false} axisLine={false} width={54} unit=" kWh" />
				<XAxis dataKey="hourLabel" tickLine={false} axisLine={false} interval={2} />
				<Area
					dataKey="production"
					type="monotone"
					fill="url(#solarForecastFill)"
					stroke="var(--color-production)"
					strokeWidth={2}
				/>
			</AreaChart>
		</ChartContainer>
	);
}
