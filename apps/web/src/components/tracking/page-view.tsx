"use client";

import { env } from "@/env.mjs";
import { trackClientEvent } from "@energyleaf/lib/tracking/track-client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function PostHogPageView() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Track pageviews
        if (pathname) {
            let url = window.origin + pathname;
            if (searchParams.toString()) {
                url = `${url}?${searchParams.toString()}`;
            }

            trackClientEvent({
                url: env.NEXT_PUBLIC_ADMIN_URL,
                title: "page/view",
                appComponent: "web",
                appFunction: "page-view",
                details: {
                    url,
                    path: pathname,
                    search: searchParams.toString(),
                },
            });
        }
    }, [pathname, searchParams]);

    return null;
}
