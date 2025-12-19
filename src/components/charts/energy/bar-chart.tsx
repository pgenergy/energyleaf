"use client";

import { format, getWeekOfMonth } from "date-fns";
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
import type { EnergyData } from "@/server/db/tables/sensor";

interface Props<T extends ChartConfig> {
	data: (EnergyData & { cost?: number })[];
	compareData?: (EnergyData & { cost?: number })[];
	simData?: (EnergyData & { cost?: number })[];
	config: T;
	dateFormat: "hour" | "day" | "weekday" | "calender-week" | "week";
	display: Extract<keyof T, string>[];
	dataKey: Extract<keyof T, string>;
}

export default function EnergyBarChart<T extends ChartConfig>(props: Props<T>) {
	const shouldShowSimData = !props.compareData && props.simData && props.simData.length > 0;

	const preparedData = useMemo(() => {
		function formatTimestamp(d: Date) {
			let timestamp = d.toISOString();

			if (props.dateFormat === "hour") {
				timestamp = `${format(d, "HH", {
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

		const simDataMap = new Map<string, EnergyData & { cost?: number }>();
		if (shouldShowSimData && props.simData) {
			for (const d of props.simData) {
				simDataMap.set(d.timestamp.toISOString(), d);
			}
		}

		const data = props.data.map((d) => {
			const simPoint = simDataMap.get(d.timestamp.toISOString());
			return {
				...d,
				total: d.consumption,
				simTotal: simPoint ? simPoint.consumption : undefined,
				simConsumption: simPoint?.consumption,
				simCost: simPoint?.cost,
				timestamp: formatTimestamp(d.timestamp),
			};
		});

		if (!props.compareData) {
			return data;
		}

		const compareData = props.compareData.map((d) => ({
			totalCompare: d.consumption,
			consumptionCompare: d.consumption,
			insertedCompare: d.inserted,
			costCompare: d.cost,
			timestamp: formatTimestamp(d.timestamp),
		}));

		if (data.length >= compareData.length) {
			return data.map((d) => ({
				...d,
				totalCompare: compareData.find((c) => c.timestamp === d.timestamp)?.totalCompare || null,
				consumptionCompare: compareData.find((c) => c.timestamp === d.timestamp)?.consumptionCompare || null,
				insertedCompare: compareData.find((c) => c.timestamp === d.timestamp)?.insertedCompare || null,
				costCompare: compareData.find((c) => c.timestamp === d.timestamp)?.costCompare || null,
			}));
		} else {
			return compareData.map((d) => ({
				...d,
				total: data.find((c) => c.timestamp === d.timestamp)?.total || null,
				consumption: data.find((c) => c.timestamp === d.timestamp)?.consumption || null,
				inserted: data.find((c) => c.timestamp === d.timestamp)?.inserted || null,
				cost: data.find((c) => c.timestamp === d.timestamp)?.cost || null,
			}));
		}
	}, [props.data, props.dateFormat, props.compareData, props.simData, shouldShowSimData]);

	const effectiveConfig = useMemo(() => {
		if (!shouldShowSimData) {
			return props.config;
		}
		return {
			...props.config,
			simTotal: {
				label: "Mit Simulation (kWh)",
				color: "var(--chart-5)",
			},
		} as T;
	}, [props.config, shouldShowSimData]);

	return (
		<ChartContainer className="max-h-96 w-full" config={effectiveConfig}>
			<BarChart
				accessibilityLayer
				data={preparedData}
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
				<YAxis dataKey={props.dataKey} type="number" interval="preserveStartEnd" />
				<XAxis dataKey="timestamp" type="category" interval="equidistantPreserveStart" />
				{props.display.map((d) => (
					<Bar key={d} dataKey={d} fill={`var(--color-${d})`} radius={8} />
				))}
				{props.compareData ? (
					<Bar dataKey={`${props.display}Compare`} fill={`var(--color-${props.display}Compare`} radius={8} />
				) : null}
				{shouldShowSimData && <Bar dataKey="simTotal" fill="var(--color-simTotal)" radius={8} />}
			</BarChart>
		</ChartContainer>
	);
}
