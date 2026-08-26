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

type DataPoint = EnergyData & { cost?: number };

export default function EnergyBarChart<T extends ChartConfig>(props: Props<T>) {
	const shouldShowSimData = !props.compareData && props.simData && props.simData.length > 0;

	const preparedData = useMemo(() => {
		function formatTimestamp(d: Date) {
			if (props.dateFormat === "hour") {
				return `${format(d, "HH", { locale: de })} Uhr`;
			}
			if (props.dateFormat === "day") {
				return format(d, "dd", { locale: de });
			}
			if (props.dateFormat === "weekday") {
				return format(d, "EEEEEE", { locale: de });
			}
			if (props.dateFormat === "calender-week") {
				return format(d, "ww", { locale: de });
			}
			if (props.dateFormat === "week") {
				return `Woche ${getWeekOfMonth(d, { weekStartsOn: 1 })}`;
			}
			return d.toISOString();
		}

		const simDataMap = new Map<string, DataPoint>();
		if (shouldShowSimData && props.simData) {
			for (const d of props.simData) {
				simDataMap.set(d.timestamp.toISOString(), d);
			}
		}

		const current = props.data.map((d) => {
			const simPoint = simDataMap.get(d.timestamp.toISOString());
			return {
				...d,
				timestamp: formatTimestamp(d.timestamp),
				simTotal: simPoint ? simPoint.consumption : undefined,
			};
		});

		if (!props.compareData) {
			return current;
		}

		const compare = props.compareData.map((d) => ({
			consumptionCompare: d.consumption,
			insertedCompare: d.inserted,
			costCompare: d.cost,
			timestamp: formatTimestamp(d.timestamp),
		}));

		if (current.length >= compare.length) {
			return current.map((d) => ({
				...d,
				consumptionCompare: compare.find((c) => c.timestamp === d.timestamp)?.consumptionCompare ?? null,
				insertedCompare: compare.find((c) => c.timestamp === d.timestamp)?.insertedCompare ?? null,
				costCompare: compare.find((c) => c.timestamp === d.timestamp)?.costCompare ?? null,
			}));
		}

		return compare.map((d) => {
			const match = current.find((c) => c.timestamp === d.timestamp);
			return {
				...d,
				consumption: match?.consumption ?? null,
				inserted: match?.inserted ?? null,
				cost: match?.cost ?? null,
			};
		});
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

	const yAxisDomain = useMemo(() => {
		const keys = props.display as string[];
		const allData = [
			...props.data,
			...(props.compareData ?? []),
			...(props.simData ?? []),
		];
		const values = allData.flatMap((d) => keys.map((key) => Number(d[key as keyof typeof d] ?? 0)));
		const max = values.length > 0 ? Math.max(...values) : 0;
		return [0, max];
	}, [props.data, props.compareData, props.simData, props.display]);

	const compareDisplayKeys = useMemo(
		() => props.display.map((d) => `${d}Compare`),
		[props.display],
	);

	return (
		<ChartContainer className="min-h-56 max-h-96 w-full" config={effectiveConfig}>
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
				<YAxis dataKey={props.dataKey} type="number" interval="preserveStartEnd" domain={yAxisDomain} />
				<XAxis dataKey="timestamp" type="category" interval="equidistantPreserveStart" />
				{props.display.map((d) => (
					<Bar key={d} dataKey={d} fill={`var(--color-${d})`} radius={8} />
				))}
				{props.compareData ? (
					compareDisplayKeys.map((key) => (
						<Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={8} />
					))
				) : null}
				{shouldShowSimData && <Bar dataKey="simTotal" fill="var(--color-simTotal)" radius={8} />}
			</BarChart>
		</ChartContainer>
	);
}