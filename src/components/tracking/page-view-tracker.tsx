"use client";

import { trackPageViewAction } from "@/server/actions/tracking";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { startTransition, useEffect } from "react";

export default function PageViewTracker() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const params = useParams();

	useEffect(() => {
		const userAgent = window.navigator.userAgent;
		const query = JSON.stringify(Object.fromEntries(searchParams));
		startTransition(async () => {
			await trackPageViewAction(pathname, query, JSON.stringify(params), userAgent);
		});
	}, [pathname, searchParams, params]);

	return null;
}
