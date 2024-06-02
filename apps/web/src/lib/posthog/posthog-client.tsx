"use client";
import posthog from "posthog-js";
import { PostHogProvider, usePostHog } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { env } from "@/env.mjs";

const posthogKey = env.NEXT_PUBLIC_POSTHOG_KEY;
if (typeof window !== "undefined" && posthogKey) {
    posthog.init(posthogKey, {
        api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false, // Disable automatic pageview capture, as we capture manually
        capture_pageleave: true,
    });
}
export function PHProvider({ children }: { children: React.ReactNode }) {
    return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

export function PostHogPageView(): null {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const posthog = usePostHog();
    // Track pageviews
    useEffect(() => {
        if (pathname && posthog) {
            let url = window.origin + pathname;
            if (searchParams.toString()) {
                url = `${url}?${searchParams.toString()}`;
            }
            posthog.capture("$pageview", {
                $current_url: url,
            });
        }
    }, [pathname, searchParams, posthog]);

    return null;
}
