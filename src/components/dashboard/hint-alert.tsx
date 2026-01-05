"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { trackHintClick, trackHintSeen } from "@/server/actions/hints";
import { LightbulbIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

interface HintAlertProps {
	hint: {
		id: string;
		hintText: string;
		linkTarget: string;
	};
}

export function HintAlert({ hint }: HintAlertProps) {
	const hasTrackedSeen = useRef(false);

	// Mark as seen on mount (only once)
	useEffect(() => {
		if (!hasTrackedSeen.current) {
			hasTrackedSeen.current = true;
			trackHintSeen(hint.id);
		}
	}, [hint.id]);

	const handleClick = async () => {
		await trackHintClick(hint.id);
	};

	return (
		<Alert className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
			<LightbulbIcon className="h-5 w-5 text-amber-500" />
			<AlertTitle className="text-amber-900 dark:text-amber-100">Hinweis</AlertTitle>
			<AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<span className="text-amber-800 dark:text-amber-200">{hint.hintText}</span>
				<Button variant="outline" size="sm" asChild className="shrink-0" onClick={handleClick}>
					<Link href={hint.linkTarget}>Details ansehen</Link>
				</Button>
			</AlertDescription>
		</Alert>
	);
}
