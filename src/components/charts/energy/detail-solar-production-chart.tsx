"use client";

import { format, getWeekOfMonth } from "date-fns";
import { de } from "date-fns/locale";
import { useMemo } from "react";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import type { EnergyData } from "@/server/db/tables/sensor";

interface Props<T extends ChartConfig> {
	data: EnergyData[];
	dateFormat: "hour" | "day" | "weekday" | "calender-week" | "week";
	config: T;
	display: Extract<keyof T, string>[];
	dataKey: Extract<keyof T, string>;
}

export default function DetailSolarProductionChart<T extends ChartConfig>(props: Props<T>) {
	const preparedData = useMemo(() => {
		function formatTimestamp(d: Date) {
			let timestamp = d.toISOString();

			if (props.dateFormat === "hour") {
				timestamp = `${format(d, "HH:mm", {
					locale: de,
				})} Uhr`;
			}

			if (props.dateFormat === "day") {
				timestamp = format(d, "dd", {
					locale: de,
				});
			}

			if (props.dateFormat === "weekday") {
				timestamp = format(d, "EEEEEE", {
					locale: de,
				});
			}

			if (props.dateFormat === "calender-week") {
				timestamp = format(d, "ww", {
					locale: de,
				});
			}

			if (props.dateFormat === "week") {
				timestamp = `Woche ${getWeekOfMonth(d, { weekStartsOn: 1 })}`;
			}

			return timestamp;
		}

		return props.data.map((d) => ({
			...d,
			total: d.inserted ?? 0,
			timestamp: formatTimestamp(d.timestamp),
		}));
	}, [props.data, props.dateFormat]);

	const yAxisDomain = useMemo(() => {
		const dataMax = Math.max(0, ...props.data.map((d) => d.inserted ?? 0));
		return [0, dataMax];
	}, [props.data]);

	return (
		<ChartContainer className="min-h-56 max-h-96 w-full" config={props.config}>
			<AreaChart
				accessibilityLayer
				className="select-none"
				data={preparedData}
				margin={{
					top: 16,
					right: 10,
					left: 10,
					bottom: 16,
				}}
			>
				<ChartLegend content={<ChartLegendContent />} />
				<ChartTooltip content={<ChartTooltipContent />} />
				<XAxis
					dataKey="timestamp"
					type="category"
					tickLine={false}
					axisLine={false}
					interval="equidistantPreserveStart"
				/>
				<YAxis
					dataKey={props.dataKey}
					tickLine={false}
					interval="preserveStartEnd"
					type="number"
					domain={yAxisDomain}
				/>
				{props.display.map((d) => (
					<Area
						key={d}
						dataKey={d}
						type="step"
						fill={`var(--color-${d})`}
						fillOpacity={0.4}
						stroke={`var(--color-${d})`}
					/>
				))}
			</AreaChart>
		</ChartContainer>
	);
}
