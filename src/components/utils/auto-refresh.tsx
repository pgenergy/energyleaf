"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { revalidatePaths } from "@/server/actions/revalidate";

interface AutoRefreshProps {
	intervalMs?: number;
	paths?: string[];
}

export function AutoRefresh({ intervalMs = 60000, paths }: AutoRefreshProps) {
	const pathname = usePathname();

	useEffect(() => {
		const interval = setInterval(() => {
			revalidatePaths(paths ?? [pathname]);
		}, intervalMs);

		return () => clearInterval(interval);
	}, [pathname, intervalMs, paths]);

	return null;
}
