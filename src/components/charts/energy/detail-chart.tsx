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
	simData?: EnergyData[];
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

		const simDataMap = new Map<string, EnergyData>();
		if (props.simData) {
			for (const d of props.simData) {
				simDataMap.set(d.timestamp.toISOString(), d);
			}
		}

		const hasDifference = props.data.map((d) => {
			const simPoint = simDataMap.get(d.timestamp.toISOString());
			return simPoint !== undefined && simPoint.consumption !== d.consumption;
		});

		return props.data.map((d, i) => {
			const simPoint = simDataMap.get(d.timestamp.toISOString());
			const showSimValue =
				simPoint !== undefined && (hasDifference[i] || hasDifference[i - 1] || hasDifference[i + 1]);

			return {
				...d,
				total: d.consumption,
				simTotal: showSimValue ? simPoint.consumption : undefined,
				timestamp: formatTimestamp(d.timestamp),
			};
		});
	}, [props.data, props.simData, props.dateFormat]);

	const effectiveConfig = useMemo(() => {
		if (!props.simData || props.simData.length === 0) {
			return props.config;
		}
		return {
			...props.config,
			simTotal: {
				label: "Mit Simulation (kWh)",
				color: "var(--chart-5)",
			},
		} as T;
	}, [props.config, props.simData]);

	const hasSimData = props.simData && props.simData.length > 0;

	const yAxisDomain = useMemo(() => {
		const dataMax = Math.max(...props.data.map((d) => d.consumption));
		const simMax = props.simData ? Math.max(...props.simData.map((d) => d.consumption)) : 0;
		return [0, Math.max(dataMax, simMax)];
	}, [props.data, props.simData]);

	return (
		<ChartContainer className="min-h-56 max-h-96 w-full" config={effectiveConfig}>
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
				{hasSimData && (
					<Area
						key="simTotal"
						dataKey="simTotal"
						type="step"
						fill="var(--color-simTotal)"
						fillOpacity={0.3}
						stroke="var(--color-simTotal)"
						strokeDasharray="4 4"
					/>
				)}
			</AreaChart>
		</ChartContainer>
	);
}
