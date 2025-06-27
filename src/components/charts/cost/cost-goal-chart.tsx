"use client";

import { Progress } from "@/components/ui/progress";
import { useMemo } from "react";

interface Props {
	total: number;
	goal: number;
	progress: number;
}

export default function CostGoalChart(props: Props) {
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
			<Progress value={props.progress} className={bgColor} barClassName={color} />
			<p className="text-center font-mono font-semibold">
				{props.total.toFixed(2)} € / {props.goal.toFixed(2)} €
			</p>
		</div>
	);
}
