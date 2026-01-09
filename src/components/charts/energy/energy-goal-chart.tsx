"use client";

import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";

interface Props {
	total: number;
	goal: number;
	progress: number;
	remaining: number;
}

export default function EnergyGoalChart(props: Props) {
	const isOverLimit = props.progress > 100;
	const displayProgress = Math.min(props.progress, 100);
	const overLimitPercentage = Math.round(props.progress - 100);

	const color = useMemo(() => {
		if (props.progress < 70) {
			return "bg-[var(--primary)]";
		}
		if (props.progress < 90) {
			return "bg-[var(--warning)]";
		}
		return "bg-[var(--destructive)]";
	}, [props.progress]);

	const bgColor = useMemo(() => {
		if (props.progress < 70) {
			return "bg-[var(--primary)]/20";
		}
		if (props.progress < 90) {
			return "bg-[var(--warning)]/20";
		}
		return "bg-[var(--destructive)]/20";
	}, [props.progress]);

	return (
		<div className="flex w-full flex-col gap-2">
			<Progress value={displayProgress} className={bgColor} barClassName={color} />
			<p className="text-center font-mono font-semibold">
				{props.total.toFixed(2)} kWh / {props.goal.toFixed(2)} kWh
			</p>
			{isOverLimit ? (
				<p className="text-center font-mono text-destructive text-sm">{overLimitPercentage}% über Limit</p>
			) : (
				<p className="text-center font-mono text-muted-foreground text-sm">
					Noch {props.remaining.toFixed(2)} kWh verfügbar
				</p>
			)}
		</div>
	);
}
