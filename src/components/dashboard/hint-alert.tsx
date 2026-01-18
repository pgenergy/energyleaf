"use client";

import { LightbulbIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { trackHintClick, trackHintSeen } from "@/server/actions/hints";

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
		<Alert className="mb-4 border-primary/15 bg-primary/5 text-primary">
			<LightbulbIcon className="h-5 w-5 text-primary/70" />
			<AlertTitle className="text-primary">Hinweis</AlertTitle>
			<AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<span className="text-sm text-primary/80">{hint.hintText}</span>
				<Button
					variant="outline"
					size="sm"
					asChild
					className="shrink-0 border-primary/30 text-primary hover:border-primary/50 hover:bg-primary/10"
					onClick={handleClick}
				>
					<Link href={hint.linkTarget}>Details ansehen</Link>
				</Button>
			</AlertDescription>
		</Alert>
	);
}
