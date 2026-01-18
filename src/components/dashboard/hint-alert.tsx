"use client";

import { ArrowRightIcon, LightbulbIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
		<Link href={hint.linkTarget} onClick={handleClick} className="group block">
			<Alert className="mb-4 border-primary/90 bg-primary/50 text-primary-foreground transition hover:bg-primary/30">
				<LightbulbIcon className="h-5 w-5 text-primary-foreground" />
				<AlertTitle className="text-primary-foreground">Hinweis</AlertTitle>
				<AlertDescription className="flex items-center justify-between gap-3">
					<span className="text-sm text-primary-foreground/90">{hint.hintText}</span>
					<ArrowRightIcon className="h-4 w-4 shrink-0 text-primary-foreground transition group-hover:translate-x-0.5" />
				</AlertDescription>
			</Alert>
		</Link>
	);
}
