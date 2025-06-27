"use client";

import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { EnergyData } from "@/server/db/tables/sensor";
import { Area, AreaChart, XAxis, YAxis } from "recharts";

interface Props {
	data: EnergyData[];
}

const chartConfig = {
	consumption: {
		color: "var(--primary)",
	},
} satisfies ChartConfig;

export default function EnergyMiniChart(props: Props) {
	return (
		<ChartContainer className="h-8 max-h-8 min-h-8 w-full" config={chartConfig}>
			<AreaChart data={props.data}>
				<defs>
					<linearGradient id="consumptionColor" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="var(--color-consumption)" stopOpacity={0.99} />
						<stop offset="50%" stopColor="var(--color-consumption)" stopOpacity={0.7} />
						<stop offset="95%" stopColor="var(--color-consumption)" stopOpacity={0.1} />
					</linearGradient>
				</defs>
				<XAxis dataKey="timestamp" tickLine={false} tick={false} hide axisLine={false} />
				<YAxis dataKey="consumption" tickLine={false} tick={false} hide axisLine={false} />
				<Area
					dataKey="consumption"
					connectNulls
					fill="url(#consumptionColor)"
					fillOpacity={1}
					stroke="var(--color-consumption)"
					type="linear"
				/>
			</AreaChart>
		</ChartContainer>
	);
}
