"use client";

import {
	ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { EnergyData } from "@/server/db/tables/sensor";
import { format, getWeekOfMonth } from "date-fns";
import { de } from "date-fns/locale";
import { useMemo } from "react";
import { Area, AreaChart, XAxis, YAxis } from "recharts";

interface Props<T extends ChartConfig> {
	data: EnergyData[];
	dateFormat: "hour" | "day" | "weekday" | "calender-week" | "week";
	config: T;
	display: Extract<keyof T, string>[];
	dataKey: Extract<keyof T, string>;
}

export default function DetailEnergyChart<T extends ChartConfig>(props: Props<T>) {
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
			total: d.valueCurrent ? d.valueCurrent / 1000 : d.value,
			timestamp: formatTimestamp(d.timestamp),
		}));
	}, [props.data, props.dateFormat]);

	return (
		<ChartContainer className="min-h-56 w-full" config={props.config}>
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
				<YAxis dataKey={props.dataKey} tickLine={false} interval="preserveStartEnd" type="number" />
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
